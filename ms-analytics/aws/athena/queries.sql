-- Q1: usuarios con cursos inscritos y calificacion promedio
SELECT
  u.id AS user_id,
  u.email,
  COUNT(DISTINCT e.course_id) AS enrolled_courses,
  AVG(r.rating) AS avg_rating
FROM urate_analytics.users_users u
LEFT JOIN urate_analytics.content_enrollments e ON u.id = e.user_id
LEFT JOIN urate_analytics.reviews_reviews r ON u.id = r.user_id
GROUP BY u.id, u.email;

-- Q2: cursos con cantidad de reseñas y promedio
SELECT
  c.id AS course_id,
  c.title,
  COUNT(r.id) AS review_count,
  AVG(r.rating) AS avg_rating
FROM urate_analytics.content_courses c
LEFT JOIN urate_analytics.reviews_reviews r ON c.id = r.course_id
GROUP BY c.id, c.title;

-- Q3: top usuarios por actividad conjunta (inscripcion + reseña)
SELECT
  u.id AS user_id,
  u.email,
  COUNT(DISTINCT e.id) AS enrollments,
  COUNT(DISTINCT r.id) AS reviews,
  (COUNT(DISTINCT e.id) + COUNT(DISTINCT r.id)) AS total_activity
FROM urate_analytics.users_users u
LEFT JOIN urate_analytics.content_enrollments e ON u.id = e.user_id
LEFT JOIN urate_analytics.reviews_reviews r ON u.id = r.user_id
GROUP BY u.id, u.email
ORDER BY total_activity DESC;

-- Q4: distribucion de rating por categoria de curso
SELECT
  c.category,
  r.rating,
  COUNT(*) AS qty
FROM urate_analytics.reviews_reviews r
JOIN urate_analytics.content_courses c ON r.course_id = c.id
GROUP BY c.category, r.rating
ORDER BY c.category, r.rating;
