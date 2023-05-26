from flask import Flask, render_template
import folium
from folium.plugins import FastMarkerCluster
import requests
import branca

app = Flask(__name__)


@app.route('/')
def index():
    # Coordonnées de Nantes
    center_lat = 47.218371
    center_lon = -1.553621

    # Création de la carte
    m = folium.Map(location=[center_lat, center_lon],
                   zoom_start=13, tiles='CartoDB dark_matter')

    marker_cluster = FastMarkerCluster(name='Arrêts', data=[]).add_to(m)
    line_cluster = FastMarkerCluster(name='Lignes', data=[]).add_to(m)
    # Données à afficher
    arrets = requests.get("http://localhost:3000/api/arret")
    arrets = arrets.json()
    circuits = requests.get("http://localhost:3000/api/circuit")
    circuits = circuits.json()

    for circuit in circuits:
        ligne = circuit["coordinates"]
        folium.PolyLine(ligne, color=circuit["couleur"]).add_to(line_cluster)


    for arret in arrets:
        #ligne_name = arret["id"]
        #enfants = arret["enfants"]

        icon = ""

        # Coordonnées
        lat = arret["latitude"]
        lon = arret["longitude"]

        stop_name = arret["nom"]
        
        html = ""

        if len(arret["lignes"]) != 0:

            correspondances_str = ""

            for key, transport in arret["lignes"].items():
                if (not icon):
                    if key == "tram":
                        icon = folium.Icon(icon='train-tram', prefix='fa')
                    elif key == "bus":
                        icon = folium.Icon(icon='bus', prefix='fa')
                    elif key == "ferry":
                        icon = folium.Icon(icon='ship', prefix='fa')
                    else:
                        icon = folium.Icon(icon='circle', prefix = 'fa')
                    
                for arret_ligne in transport:
                    correspondances_str += "<br>" + arret_ligne["id"] + ' : ' + arret_ligne["nom"]

        else:
            icon = folium.Icon(icon='circle', prefix = 'fa')

        acces_handicape = arret["acces_handicape"]
        
        if acces_handicape is True:
            # placeHandicape = '<i class="fa-solid fa-wheelchair"></i>'
            placeHandicape = 'CHECK'

        else :
            # placeHandicape = '<i class="fa-regular fa-xmark"></i>'
            placeHandicape = 'PAS CHECK'
            
        html += '''Nom arrêt : '''+stop_name+'''<br>
        '''+placeHandicape+'''
        Correspondances : '''+ correspondances_str +'''<br>
        '''
        imageCommerce = "<img style='width: 150px; height: 150px' src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Crois%C3%A9e_trams_Nantes.jpg/1200px-Crois%C3%A9e_trams_Nantes.jpg'>"
        imageBouffay = "<img style='width: 150px; height: 150px' src='https://fastly.4sqi.net/img/general/600x600/256867_ARO8HYVlox8bjuhZUwl48RFKo4iOty_H0STsuaUVW6Y.jpg'>"
        imageMediatheque = "<img style='width: 150px; height: 150px' src='https://i.ytimg.com/vi/LVAb6ktEkn4/maxresdefault.jpg'>"
        
        if arret["nom"] == "Commerce" :
            html += imageCommerce
        elif arret["nom"] == "Bouffay" :
            html += imageBouffay
        elif arret["nom"] == "Médiathèque" :
            html += imageMediatheque
            
        iframe = folium.IFrame(html, width=200, height=200)

        popup = folium.Popup(iframe)

        folium.Marker(
            [lat, lon], popup=popup, tooltip=stop_name, icon=icon
            # [lat, lon], popup=popup, tooltip=stop_name

        ).add_to(marker_cluster)

    # Ajouter la légende
    legend_html = '''
                    {% macro html(this, kwargs) %}
                    <!doctype html>
                    <html lang="en">
                    <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">                   
                    </head>
                    <body>
                    <div style="position: fixed;
                                    bottom: 20px; left: 20px;
                                    background-color: white;
                                    padding: 10px;
                                    border: 2px solid gray;
                                    z-index: 1000;">
                            <p style="margin: 0;"><b>Légende</b></p>
                            <p style="margin: 0;"><i class="fas fa-train-tram"></i> Tram</p>
                            <p style="margin: 0;"><i class="fas fa-bus"></i> Bus</p>
                            <p style="margin: 0;"><i class="fas fa-ship"></i> Ferry</p>
                        </div>
                    {% endmacro %}
                  '''
    legend = branca.element.MacroElement()
    legend._template = branca.element.Template(legend_html)

    # Rendu de la carte en HTML
    folium.LayerControl().add_to(m)
    m.get_root().add_child(legend)
    m.save('map.html')
    return m.get_root().render()


if __name__ == '__main__':
    app.run(debug=True)
