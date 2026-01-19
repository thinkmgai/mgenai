# 자연어 질문 30~50개 확장 + 카테고리별 SQL 템플릿 자동 생성 표

## 1) 자연어 질문 리스트 (50개, 카테고리별)

### A. 트래픽/사용자 활동 (10)
1. 지난 7일 DAU 추이 보여줘
2. 지난 30일 MAU 추이 보여줘
3. 어제 설치 수와 실행 수 알려줘
4. 지난 7일 재방문율(7일 재방문) 추이 알려줘
5. iOS/Android 사용자 비중 추이 보여줘
6. 특정 앱 버전별 방문 수 비교해줘
7. 국가별 방문 수 TOP 10 보여줘
8. 시간대별 방문 피크 시간 알려줘
9. 로그인 사용자 비율 추이 보여줘
10. 신규 유저와 기존 유저 비율 알려줘

### B. 성능/로딩 (10)
11. 최근 7일 평균 로딩 시간 추이 보여줘
12. 최근 7일 평균 응답시간(response_time) 추이 보여줘
13. 로딩 시간이 가장 긴 페이지 TOP 10 알려줘
14. TTFB 평균이 높은 페이지 TOP 10 보여줘
15. LCP가 급증한 날짜 알려줘
16. INP 평균이 높은 페이지 TOP 10 알려줘
17. 페이지별 평균 체류시간(loading_time 기반) 비교해줘
18. 앱 버전별 로딩 시간 비교해줘
19. 디바이스 모델별 평균 로딩 시간 비교해줘
20. 네트워크 타입(com_type)별 로딩 시간 비교해줘

### C. 오류/크래시 (10)
21. 지난 7일 크래시 발생 추이 알려줘
22. 에러율이 높은 페이지 TOP 10 보여줘
23. JS 에러 급증한 날짜 알려줘
24. 디바이스 모델별 crash count 비교해줘
25. OS 버전별 오류 발생률 비교해줘
26. 특정 페이지의 오류 로그 상세 보여줘
27. 에러 발생률이 가장 높은 시간대 알려줘
28. 특정 앱 버전의 crash rate 알려줘
29. 로그 타입별 오류 건수 분포 보여줘
30. 최근 30일 중 이상치(오류 급증일) 알려줘

### D. 페이지 흐름/행동 (8)
31. 페이지 전환 순서 TOP 3 흐름 보여줘
32. 특정 페이지 방문 후 이탈이 많은 페이지 알려줘
33. 페이지별 평균 이벤트 수 비교해줘
34. 페이지별 평균 request_count 비교해줘
35. 유입 페이지 기준 전환율 높은 페이지 알려줘
36. 이전 페이지(pre_url)별 다음 페이지 분포 보여줘
37. 페이지별 세션당 방문 수 알려줘
38. 사용자별 페이지 체류시간 분포 알려줘

### E. 마케팅/유입 (7)
39. 지난 30일 유입 채널별 방문 수 알려줘
40. organic vs paid 사용자 비율 추이 보여줘
41. 캠페인별 전환 이벤트 수 알려줘
42. 유입 소스별 주요 이벤트 TOP 5 알려줘
43. 특정 캠페인 기간별 사용자 증가 추이 알려줘
44. 신규 설치 사용자 유입 채널 비중 알려줘
45. 지역별(국가/도시) 유입량 TOP 10 알려줘

### F. 예측/패턴 (5)
46. 다음 7일 크래시 추이 예측해줘
47. 다음 7일 DAU 예측해줘
48. 로딩 시간 급증 패턴 탐지해줘
49. 오류율 급등 패턴 탐지해줘
50. 사용자 이탈 패턴(방문 후 로그 없음) 알려줘

---

## 2) 카테고리별 SQL 템플릿 자동 생성 표

> 표의 템플릿은 **자연어 → SQL 생성기**에서 파라미터(기간, 조건, 그룹핑, Top N)를 주입해 완성하도록 설계했습니다.

### A. 트래픽/사용자 활동

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| DAU 추이 | 기간(days) | maxy_device_statistic | `SELECT stat_date, dau FROM maxy_device_statistic WHERE stat_date >= today()-{days} ORDER BY stat_date` |
| MAU 추이 | 기간(days) | maxy_device_statistic | `SELECT stat_date, mau FROM maxy_device_statistic WHERE stat_date >= today()-{days} ORDER BY stat_date` |
| 설치/실행 수 | 날짜 | maxy_device_access_history | `SELECT sum(install_cnt), sum(visit_cnt) FROM maxy_device_access_history WHERE log_date = {date}` |
| 재방문율 | 기간(days) | maxy_device_statistic | `SELECT stat_date, revisit_7d FROM maxy_device_statistic WHERE stat_date >= today()-{days}` |
| OS 비중 | 기간(days) | maxy_device_page_flow | `SELECT os_type, count() FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY os_type` |

### B. 성능/로딩

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| 로딩시간 추이 | 기간(days) | maxy_page_daily | `SELECT log_date, avgMerge(avg_loading_tm) AS avg_loading FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 응답시간 추이 | 기간(days) | maxy_page_daily | `SELECT log_date, sumMerge(sum_response_tm) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 로딩시간 TOP N | 기간(days), topN | maxy_page_daily | `SELECT page_name, avgMerge(avg_loading_tm) AS avg_loading FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY page_name ORDER BY avg_loading DESC LIMIT {topN}` |
| TTFB TOP N | 기간(days), topN | maxy_device_page_flow | `SELECT page_name, avg(ttfb) FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY page_name ORDER BY avg(ttfb) DESC LIMIT {topN}` |
| 버전별 로딩 | 기간(days) | maxy_device_page_flow | `SELECT app_ver, avg(loading_time) FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY app_ver` |

### C. 오류/크래시

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| 크래시 추이 | 기간(days) | maxy_page_daily | `SELECT log_date, sumMerge(sum_crash_count) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 에러율 TOP N | 기간(days), topN | maxy_page_daily | `SELECT page_name, sumMerge(sum_error_count)/sumMerge(sum_log_count) AS error_rate FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY page_name ORDER BY error_rate DESC LIMIT {topN}` |
| JS 에러 급증 | 기간(days) | maxy_page_daily | `SELECT log_date, sumMerge(sum_js_error_count) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 모델별 크래시 | 기간(days) | maxy_model_hourly | `SELECT device_model, sumMerge(sum_crash_count) FROM maxy_model_hourly WHERE hour_bucket >= now()-INTERVAL {days} DAY GROUP BY device_model` |
| 버전별 크래시 | 기간(days) | maxy_device_page_flow | `SELECT app_ver, sum(crash_count) FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY app_ver` |

### D. 페이지 흐름/행동

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| 페이지 전환 TOP | 기간(days), topN | maxy_device_page_flow | `SELECT pre_url, page_name, count() AS cnt FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY pre_url, page_name ORDER BY cnt DESC LIMIT {topN}` |
| 페이지 이탈 | 기간(days), page | maxy_device_page_flow | `SELECT pre_url, count() FROM maxy_device_page_flow WHERE log_date >= today()-{days} AND page_name = {page} GROUP BY pre_url` |
| 페이지별 이벤트 수 | 기간(days) | maxy_page_daily | `SELECT page_name, sumMerge(sum_event_count) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY page_name` |
| 페이지별 요청수 | 기간(days) | maxy_page_daily | `SELECT page_name, sumMerge(sum_request_count) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY page_name` |
| 세션당 방문수 | 기간(days) | maxy_device_page_flow | `SELECT page_name, count()/uniqExact(device_id) AS visits_per_user FROM maxy_device_page_flow WHERE log_date >= today()-{days} GROUP BY page_name` |

### E. 마케팅/유입

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| 유입 채널별 방문 | 기간(days) | maxy_mkt_event_log | `SELECT traffic_source, count() FROM maxy_mkt_event_log WHERE event_date >= today()-{days} GROUP BY traffic_source` |
| organic vs paid | 기간(days) | maxy_mkt_event_log | `SELECT medium, count() FROM maxy_mkt_event_log WHERE event_date >= today()-{days} GROUP BY medium` |
| 캠페인별 전환 | 기간(days), event | maxy_mkt_event_log | `SELECT campaign, count() FROM maxy_mkt_event_log WHERE event_date >= today()-{days} AND event_name = {event} GROUP BY campaign` |
| 지역별 유입 | 기간(days), topN | maxy_mkt_event_log | `SELECT geo_country, count() FROM maxy_mkt_event_log WHERE event_date >= today()-{days} GROUP BY geo_country ORDER BY count() DESC LIMIT {topN}` |
| 신규 설치 유입 | 기간(days) | maxy_mkt_event_log | `SELECT traffic_source, countIf(is_first_install = 1) FROM maxy_mkt_event_log WHERE event_date >= today()-{days} GROUP BY traffic_source` |

### F. 예측/패턴

| 질문 유형 | 파라미터 | 기본 테이블 | SQL 템플릿 (개요) |
|---|---|---|---|
| 크래시 예측 | 기간(days) | maxy_page_daily | `SELECT log_date, sumMerge(sum_crash_count) AS crash_cnt FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| DAU 예측 | 기간(days) | maxy_device_statistic | `SELECT stat_date, dau FROM maxy_device_statistic WHERE stat_date >= today()-{days} ORDER BY stat_date` |
| 로딩 급증 탐지 | 기간(days) | maxy_page_daily | `SELECT log_date, avgMerge(avg_loading_tm) FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 오류율 급등 탐지 | 기간(days) | maxy_page_daily | `SELECT log_date, sumMerge(sum_error_count)/sumMerge(sum_log_count) AS error_rate FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY log_date` |
| 이탈 패턴 | 기간(days) | maxy_device_access_history | `SELECT log_date, countIf(visit_cnt=1) AS one_time_users FROM maxy_device_access_history WHERE log_date >= today()-{days} GROUP BY log_date` |

---

## 3) 자동 생성 규칙(요약)

- **기간 파라미터**: “최근 N일/주/월” → `{days}`
- **그룹핑 키워드**: “추이/변화” → `GROUP BY date` / “TOP N” → `ORDER BY ... LIMIT {topN}`
- **필터 키워드**: “iOS/Android/웹” → `WHERE os_type = 'ios'` 등
- **비율 지표**: “율/비중” → `sum(x)/sum(y)` 형태로 자동 생성
- **예측 요청**: SQL로 시계열 추출 후 **모델 레이어**에서 예측 수행

필요하면 다음 단계로 **실제 질문-의도 분류기 정의 + 키워드 사전 + SQL 템플릿 코드 구조**까지 이어서 설계해드릴게요.
