from flask import Flask, render_template
from folium.plugins import Fullscreen
import folium

app = Flask(__name__)

@app.route('/')
def index():
    # Coordonnées de Paris
    lat = 47.218371
    lon = -1.553621

    # Création de la carte
    m = folium.Map(location=[lat, lon], zoom_start=13, tiles='OpenStreetMap')

    # Ajout du plugin Fullscreen
    Fullscreen().add_to(m)

    # Rendu de la carte en HTML
    map_html = m._repr_html_()

    return render_template('map.html', map_html=map_html)

if __name__ == '__main__':
    app.run(debug=True)