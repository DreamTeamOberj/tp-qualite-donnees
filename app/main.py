from flask import Flask, render_template
import folium

app = Flask(__name__)

@app.route('/')
def index():
    # Coordonnées de Paris
    center_lat = 47.218371
    center_lon = -1.553621

   
    # Création de la carte
    m = folium.Map(location=[center_lat, center_lon], zoom_start=13, tiles='OpenStreetMap')

    # Données à afficher
    data = {"nhits": 3703, "parameters": {"dataset": "244400404_tan-arrets", "rows": 2, "start": 0, "format": "json", "timezone": "UTC"}, "records": [{"datasetid": "244400404_tan-arrets", "recordid": "46060173fb84de8e90b22f37f8bdbe47b01c977a", "fields": {"stop_id": "ABDU", "stop_coordinates": [47.22024715, -1.60339908], "location_type": "1", "stop_name": "Abel Durand"}, "geometry": {"type": "Point", "coordinates": [-1.60339908, 47.22024715]}, "record_timestamp": "2021-09-02T15:20:35.205Z"}, {"datasetid": "244400404_tan-arrets", "recordid": "80346625df64c948585a2f8e3765647ff235c0b0", "fields": {"stop_id": "ABOL", "stop_coordinates": [47.26791335, -1.47684627], "location_type": "1", "stop_name": "Adrienne Bolland"}, "geometry": {"type": "Point", "coordinates": [-1.47684627, 47.26791335]}, "record_timestamp": "2021-09-02T15:20:35.205Z"}]}
    
    for record in data["records"]:
        stop_name = record["fields"]["stop_name"]
        # Coordonnées
        lat = record["fields"]["stop_coordinates"][0]
        lon = record["fields"]["stop_coordinates"][1]
        folium.Marker(
            [lat, lon], popup="<i>test</i>", tooltip=stop_name
        ).add_to(m)

    # Rendu de la carte en HTML
    map_html = m._repr_html_()

    return render_template('map.html', map_html=map_html)

if __name__ == '__main__':
    app.run(debug=True)