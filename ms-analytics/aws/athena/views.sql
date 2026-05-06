CREATE OR REPLACE VIEW urate_analytics.v_user_learning_profile AS
SELECT
  u.id AS user_id,
  u.email,
  COUNT(DISTINCT e.course_id) AS enrolled_courses,
  AVG(r.rating) AS avg_rating_given
FROM urate_analytics.users_users u
LEFT JOIN urate_analytics.content_enrollments e ON u.id = e.user_id
LEFT JOIN urate_analytics.reviews_reviews r ON u.id = r.user_id
GROUP BY u.id, u.email;

CREATE OR REPLACE VIEW urate_analytics.v_course_quality AS
SELECT
  c.id AS course_id,
  c.title,
  c.category,
  COUNT(r.id) AS total_reviews,
  AVG(r.rating) AS avg_course_rating
FROM urate_analytics.content_courses c
LEFT JOIN urate_analytics.reviews_reviews r ON c.id = r.course_id
GROUP BY c.id, c.title, c.category;
