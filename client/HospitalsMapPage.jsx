
import GoogleMapReact from 'google-map-react';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

import { Session } from 'meteor/session';
import { Random } from 'meteor/session';

import { get, cloneDeep } from 'lodash';

import { MapDot } from './MapDot';

import { HTTP } from 'meteor/http';


const AnyReactComponent = ({ text }) => <Card><CardContent>{text}</CardContent></Card>;

Session.setDefault('mapName', false);

export class HospitalsMapPage extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {
    let data = {
      style: {
        page: {
          position: 'fixed',
          top: '0px',
          left: '0px',
          height: Session.get('appHeight'),
          width: Session.get('appWidth')
        }
      },
      center: {
        lat: 41.8748903,
        lng: -87.7035464
      },
      zoom: 13.9,
      layers: {
        heatmap: true,
        points: true
      },
      options: {
        panControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#dadada"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#c9c9c9"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }
        ]
      },
      geoJsonLayer: Session.get('geoJsonLayer')
    };

    data.apiKey = get(Meteor, 'settings.public.google.maps.apiKey', '');
    data.geodataUrl = get(Meteor, 'settings.public.google.maps.geodataUrl')

    if(Session.get('geojsonUrl')){
      data.geodataUrl = Session.get('geojsonUrl');
    }

    if(get(Meteor.user(), 'profile.locations.home.position.latitude') && get(Meteor.user(), 'profile.locations.home.position.longitude')){
      data.center.lat = get(Meteor.user(), 'profile.locations.home.position.latitude');
      data.center.lng = get(Meteor.user(), 'profile.locations.home.position.longitude');
    }       
    

    if(process.env.NODE_ENV === "test") {
        console.log("HospitalsMapPage[data]", data);
    }
    return data;
  }
  render(){
    var self = this;
    var map;
    var globalGoogle;

    let geoJsonLayer = this.data.geoJsonLayer;

    if(process.env.NODE_ENV !== "test"){
      map = <GoogleMapReact
           id="googleMap"
           defaultCenter={this.data.center}
           defaultZoom={this.data.zoom}
           options={this.data.options}
           bootstrapURLKeys={{
            key: this.data.apiKey,
            libraries: 'visualization'
           }}
           yesIWantToUseGoogleMapApiInternals
           onGoogleApiLoaded={function({map, maps}){


            //----------------------------------------------------------------------------------------------------
            // Diagnostics

            if(process.env.NODE_ENV === "test"){
                console.log('maps', maps)
                console.log('map', map)
            }
            
            //----------------------------------------------------------------------------------------------------
            // Layers

            // let myLayers = new maps.MVCObject();
            // myLayers.setValues({
            //   hospitals: null,
            //   laboratories: null,
            //   patientHomes: map
            // });

            // let hospitalMarker = new google.maps.Marker({
            //   map: map,
            //   draggable: true,
            //   // animation: google.maps.Animation.DROP,
            //   position: {lat: 41.8955885, lng: -87.6208858}
            // });
            // hospitalMarker.bindTo('map', myLayers, 'parks');

            // //show the hospitals
            // myLayers.set('hospitals', map);

            // //hide the laboratories
            // myLayers.set('laboratories', null);

            //----------------------------------------------------------------------------------------------------

            // // load US state outline polygons from a GeoJson file
            // map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'STATE' });


            var dataLayer = [];
            var markerArray = [];

            let heatMapGradient = [
              'rgba(255, 255, 255, 0)',
              'rgba(251, 251, 213, 1)',
              'rgba(249, 234, 189, 1)',
              'rgba(247, 217, 165, 1)',
              'rgba(243, 184, 118, 1)',
              'rgba(242, 168, 94, 1)',
              'rgba(240, 151, 71, 1)',
              'rgba(238, 135, 47, 1)',
              'rgba(236, 118, 23, 1)',
              'rgba(210, 80, 0, 1)'
            ];


            var baseUrl = Meteor.absoluteUrl();
            if(get(Meteor, 'settings.public.baseUrl')){
              baseUrl = get(Meteor, 'settings.public.baseUrl');
            }

            var geodataUrl = baseUrl + '/packages/symptomatic_covid19-on-fhir/geodata/covid19-patients-synthea.geojson';
            //var geodataUrl = 'https://data.cityofchicago.org/resource/6zsd-86xi.geojson';
            if(get(self, "data.geodataUrl")){
              geodataUrl = get(self, "data.geodataUrl");
            }

            if(process.env.NODE_ENV === "test"){
                console.log('geodataUrl', geodataUrl);
            }

            if(geoJsonLayer){
              geoJsonLayer.features.forEach(function(feature){
                if(get(feature, 'geometry.coordinates[0]') && get(feature, 'geometry.coordinates[1]')){                    
                  dataLayer.push({location: new maps.LatLng(get(feature, 'geometry.coordinates[1]'), get(feature, 'geometry.coordinates[0]')), weight: 5});
                }
              })
              
              map.data.addGeoJson(geoJsonLayer, { idPropertyName: 'id' });

              // if we turn on the heatmap
              var heatmap = new maps.visualization.HeatmapLayer({
                data: dataLayer,
                map: map
              });

              heatmap.set('radius', 10);
              heatmap.set('opacity', 0.5);
              heatmap.set('dissipating', false);
              heatmap.set('maxIntensity', 50);
              heatmap.set('gradient', heatMapGradient);
              heatmap.setMap(map);

            } else {              
              console.log('Ohai, which geodataUrl are we fetching:  ' + geodataUrl)
              HTTP.get(geodataUrl, function(error, data){
                var geojson = EJSON.parse(data.content);
                console.log('loadGeoJson', geojson);

                geojson.features.forEach(function(feature){
                  if(get(feature, 'geometry.coordinates[0]') && get(feature, 'geometry.coordinates[1]')){                    
                    dataLayer.push({location: new maps.LatLng(get(feature, 'geometry.coordinates[1]'), get(feature, 'geometry.coordinates[0]')), weight: 5});
                  }
                })

                console.log('Constructed a datalayer to render.', dataLayer)

                if(process.env.NODE_ENV === "test"){
                  console.log('dataLayer', dataLayer);
                }

                // map.data.addGeoJson(geoJsonLayer);  
                map.data.loadGeoJson(geodataUrl);

                // if we turn on the heatmap
                var heatmap = new maps.visualization.HeatmapLayer({
                  data: dataLayer,
                  map: map
                });

                heatmap.set('radius', 10);
                heatmap.set('opacity', 0.5);
                heatmap.set('dissipating', false);
                heatmap.set('maxIntensity', 50);                
                heatmap.set('gradient', heatMapGradient);
                heatmap.setMap(map);
              });
            }              

            map.data.setStyle({
              // raw binary data (extremely fast!)
              icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NUlH5v9rF5f+ZoCAwHaig8B8oPhOmKC1NU/P//7Q0DByrqgpSGAtSdOCAry9WRXt9fECK9oIUPXwYFYVV0e2ICJCi20SbFAuyG5uiECUlkKIQmOPng3y30d0d7Lt1bm4w301jQAOgcNoIDad1yOEEAFm9fSv/VqtJAAAAAElFTkSuQmCC',
  
              // load from a content delivery network
              // icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'

              // load from Meteor server
              //icon: Meteor.absoluteUrl() + 'geodata/icons/purple-dot.png'

              // load from googleapis
              //icon: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=A&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1'

              // load a Symbol
              // icon: {
              //   path: maps.SymbolPath.CIRCLE,
              //   fillColor: '#EB6600',
              //   fillOpacity: 0.1,
              //   strokeColor: '',
              //   strokeWeight: 0.5,
              //   scale: 5
              // },
              fillColor: '#ffffff',
              fillOpacity: 0.2,
              strokeColor: '#EB6600',
              strokeWeight: 0.5

              // Text Label
              //label: {
              //  color: "blue",
              //  fontFamily: "Courier",
              //  fontSize: "24px",
              //  fontWeight: "bold",
              //  text: 'foo'
              //}
            });

          }}
         >            

          {/* <div className='homeBox' lat={this.data.center.lat} lng={ this.data.center.lng} style={{width: '180px'}}>            
            <MapOrbital />
            <MapDot />
          </div> */}          

         </GoogleMapReact>;
    } else {
      console.log("NOTICE:  You are running in the 'test' environment.  Google Maps and other external libraries are disabled to prevent errors with the automated test runners.")
    }
    return(
      <div id="mapsPage" style={this.data.style.page}>
        {map}
      </div>
    );
  }
}

ReactMixin(HospitalsMapPage.prototype, ReactMeteorData);
export default HospitalsMapPage;