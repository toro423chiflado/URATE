import io
import os
from datetime import datetime, timezone

import boto3
import pandas as pd
from sqlalchemy import create_engine, text


def env(name: str, default: str = "") -> str:
    value = os.getenv(name, default).strip()
    if not value:
        raise ValueError(f"Missing env var: {name}")
    return value


def load_table(engine, table_name: str) -> pd.DataFrame:
    query = text(f"SELECT * FROM {table_name}")
    return pd.read_sql(query, engine)


def to_buffer(df: pd.DataFrame, output_format: str) -> tuple[io.BytesIO, str]:
    buffer = io.BytesIO()
    if output_format == "json":
        payload = df.to_json(orient="records", date_format="iso", force_ascii=False)
        buffer.write(payload.encode("utf-8"))
        return buffer, "json"

    csv_payload = df.to_csv(index=False)
    buffer.write(csv_payload.encode("utf-8"))
    return buffer, "csv"


def upload_to_s3(s3_client, bucket: str, key: str, payload: io.BytesIO) -> None:
    payload.seek(0)
    s3_client.upload_fileobj(payload, bucket, key)


def main() -> None:
    service_name = env("SERVICE_NAME")
    source_db_url = env("SOURCE_DB_URL")
    tables_raw = env("TABLES")
    bucket = env("S3_BUCKET")
    region = env("AWS_REGION", "us-east-1")
    s3_prefix = env("S3_PREFIX", "raw")
    output_format = env("OUTPUT_FORMAT", "csv").lower()

    if output_format not in {"csv", "json"}:
        raise ValueError("OUTPUT_FORMAT must be csv or json")

    tables = [t.strip() for t in tables_raw.split(",") if t.strip()]
    if not tables:
        raise ValueError("TABLES must include at least one table")

    engine = create_engine(source_db_url)
    s3_client = boto3.client("s3", region_name=region)
    ingestion_ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    for table_name in tables:
        df = load_table(engine, table_name)
        payload, extension = to_buffer(df, output_format)
        key = f"{s3_prefix}/{service_name}/{table_name}/ingestion_ts={ingestion_ts}/{table_name}.{extension}"
        upload_to_s3(s3_client, bucket, key, payload)
        print(f"Uploaded: s3://{bucket}/{key} rows={len(df)}")


if __name__ == "__main__":
    main()
