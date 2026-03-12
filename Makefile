.PHONY: all
all: load_community_areas load_data

.PHONY: clean
clean:
	rm data/raw/chicago-restaurants.csv data/raw/community-areas.geojson

.PHONY: load_community_areas
load_community_areas: data/raw/community-areas.geojson
	python manage.py load_community_areas $^

.PHONY: load_data
load_data: data/raw/chicago-restaurants.csv
	python manage.py load_restaurant_permits $^

data/raw/chicago-restaurants.csv:
	curl "https://data.cityofchicago.org/api/v3/views/fr9j-f3pa/query.csv?query=SELECT%0A%20%20%60id%60%2C%0A%20%20%60permit_%60%2C%0A%20%20%60permit_type%60%2C%0A%20%20%60review_type%60%2C%0A%20%20%60application_start_date%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60processing_time%60%2C%0A%20%20%60street_number%60%2C%0A%20%20%60street_direction%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60work_description%60%2C%0A%20%20%60building_fee_paid%60%2C%0A%20%20%60zoning_fee_paid%60%2C%0A%20%20%60other_fee_paid%60%2C%0A%20%20%60subtotal_paid%60%2C%0A%20%20%60building_fee_unpaid%60%2C%0A%20%20%60zoning_fee_unpaid%60%2C%0A%20%20%60other_fee_unpaid%60%2C%0A%20%20%60subtotal_unpaid%60%2C%0A%20%20%60building_fee_waived%60%2C%0A%20%20%60zoning_fee_waived%60%2C%0A%20%20%60other_fee_waived%60%2C%0A%20%20%60subtotal_waived%60%2C%0A%20%20%60total_fee%60%2C%0A%20%20%60reported_cost%60%2C%0A%20%20%60community_area%60%2C%0A%20%20%60census_tract%60%2C%0A%20%20%60ward%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%0AWHERE%0A%20%20%60issue_date%60%0A%20%20%20%20BETWEEN%20%222016-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222026-03-09T00%3A00%3A00%22%20%3A%3A%20floating_timestamp&app_token=$$CDP_APP_TOKEN" -o $@

data/raw/community-areas.geojson:
	curl https://data.cityofchicago.org/resource/igwz-8jzy.geojson -o $@
