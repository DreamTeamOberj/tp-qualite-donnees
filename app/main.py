from flask import Flask, render_template
import folium
from folium.plugins import MarkerCluster
import requests

app = Flask(__name__)

@app.route('/')
def index():
    # Coordonnées de Paris
    center_lat = 47.218371
    center_lon = -1.553621

   
    # Création de la carte
    m = folium.Map(location=[center_lat, center_lon], zoom_start=13, tiles='OpenStreetMap')

    marker_cluster = MarkerCluster().add_to(m)

    # Données à afficher
    arrets = requests.get("http://localhost:3000/api/arret")
    arrets = arrets.json()
       
    for arret in arrets:
        stop_name = arret["nom"]
        # Coordonnées
        lat = arret["latitude"]
        lon = arret["longitude"]
        folium.Marker(
            [lat, lon], popup="<i>test</i>", tooltip=stop_name
        ).add_to(marker_cluster)

    # Rendu de la carte en HTML
    map_html = m._repr_html_()

    return render_template('map.html', map_html=map_html)

if __name__ == '__main__':
    app.run(debug=True)