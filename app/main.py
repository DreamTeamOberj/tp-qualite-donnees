from flask import Flask, render_template
import folium
from folium.plugins import FastMarkerCluster
import requests

app = Flask(__name__)

@app.route('/')
def index():
    # Coordonnées de Nantes
    center_lat = 47.218371
    center_lon = -1.553621

    # Création de la carte
    m = folium.Map(location=[center_lat, center_lon], zoom_start=13, tiles='CartoDB dark_matter')

    marker_cluster = FastMarkerCluster(name='Arrêts', data=[]).add_to(m)
    line_cluster = FastMarkerCluster(name='Lignes', data=[]).add_to(m)
    # Données à afficher
    arrets = requests.get("http://localhost:3000/api/arret")
    arrets = arrets.json()
    circuits = requests.get("http://localhost:3000/api/circuit")
    circuits = circuits.json(   )

    for circuit in circuits:
        ligne = circuit["coordinates"]
        folium.PolyLine(ligne, color=circuit["couleur"]).add_to(line_cluster)

    for arret in arrets:
        #ligne_name = arret["id"]
        enfants = arret["enfants"]

        # Coordonnées
        lat = arret["latitude"]
        lon = arret["longitude"]

        if type in circuits == "Bus":
            icon = folium.Icon(icon='train', prefix='fa')
        elif type in circuits == "Tram":
            icon = folium.Icon(icon='train-tram', prefix='fa')
        else :
            icon = folium.Icon(icon='ship', prefix='fa')

        html = ""

        for enfant in enfants:
            stop_name = arret["nom"]
            nom = arret["nom"]
            acces_handicape = enfant["acces_handicape"]

            html += '''<br>Ligne = '''+stop_name+'''<br>
            Nom arrêt = '''+nom+'''<br>
            '''

            if acces_handicape == True:
                html += "Places handicapées : 1"
            else:
                html += "Places handicapées : 2"

        iframe = folium.IFrame(html, width=200, height=200)

        popup = folium.Popup(iframe)

        folium.Marker(
            [lat, lon], popup=popup, tooltip=stop_name, icon=icon
        ).add_to(marker_cluster)

    # Rendu de la carte en HTML
    folium.LayerControl().add_to(m)
    map_html = m._repr_html_()
    return render_template('map.html', map_html=map_html)

if __name__ == '__main__':
    app.run(debug=True)
