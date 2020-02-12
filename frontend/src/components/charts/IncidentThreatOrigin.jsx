import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";

class IncidentThreatOrigin extends Component {

  render() {
      var country_iso3_dict = {
          "Afghanistan": "South Asia",
          "Albania": "Europe & Central Asia",
          "Algeria": "Middle East & North Africa",
          "Angola": "Sub-Saharan Africa",
          "Antigua and Barbuda": "Latin America & Caribbean",
          "Argentina": "Latin America & Caribbean",
          "Armenia": "Europe & Central Asia",
          "Australia": "East Asia & Pacific",
          "Austria": "Europe & Central Asia",
          "Azerbaijan": "Europe & Central Asia",
          "Bahamas": "Latin America & Caribbean",
          "Bahrain": "Middle East & North Africa",
          "Bangladesh": "South Asia",
          "Barbados": "Latin America & Caribbean",
          "Belarus": "Europe & Central Asia",
          "Belgium": "Europe & Central Asia",
          "Belize": "Latin America & Caribbean",
          "Benin": "Sub-Saharan Africa",
          "Plurinational State of Bolivia": "Latin America & Caribbean",
          "Bosnia and Herzegovina": "Europe & Central Asia",
          "Botswana": "Sub-Saharan Africa",
          "Brazil": "Latin America & Caribbean",
          "Bulgaria": "Europe & Central Asia",
          "Burkina Faso": "Sub-Saharan Africa",
          "Burundi": "Sub-Saharan Africa",
          "Cambodia": "East Asia & Pacific",
          "Cameroon": "Sub-Saharan Africa",
          "Canada": "North America",
          "Central African Republic": "Sub-Saharan Africa",
          "Chad": "Sub-Saharan Africa",
          "Chile": "Latin America & Caribbean",
          "China": "East Asia & Pacific",
          "Colombia": "Latin America & Caribbean",
          "Democratic Republic of the Congo": "Sub-Saharan Africa",
          "Congo": "Sub-Saharan Africa",
          "Costa Rica": "Latin America & Caribbean",
          "Ivory Coast": "Sub-Saharan Africa",
          "Croatia": "Europe & Central Asia",
          "Cyprus": "Europe & Central Asia",
          "Czech Republic": "Europe & Central Asia",
          "Denmark": "Europe & Central Asia",
          "Djibouti": "Middle East & North Africa",
          "Dominica": "Latin America & Caribbean",
          "Dominican Republic": "Latin America & Caribbean",
          "Ecuador": "Latin America & Caribbean",
          "Egypt": "Middle East & North Africa",
          "El Salvador": "Latin America & Caribbean",
          "Eritrea": "Sub-Saharan Africa",
          "Estonia": "Europe & Central Asia",
          "Ethiopia": "Sub-Saharan Africa",
          "Fiji": "East Asia & Pacific",
          "Finland": "Europe & Central Asia",
          "France": "Europe & Central Asia",
          "Gabon": "Sub-Saharan Africa",
          "Gambia": "Sub-Saharan Africa",
          "Georgia": "Europe & Central Asia",
          "Germany": "Europe & Central Asia",
          "Ghana": "Sub-Saharan Africa",
          "Greece": "Europe & Central Asia",
          "Grenada": "Latin America & Caribbean",
          "Guatemala": "Latin America & Caribbean",
          "Guinea": "Sub-Saharan Africa",
          "Guinea-Bissau": "Sub-Saharan Africa",
          "Guyana": "Latin America & Caribbean",
          "Haiti": "Latin America & Caribbean",
          "Honduras": "Latin America & Caribbean",
          "Hong Kong SAR, China": "East Asia & Pacific",
          "Hungary": "Europe & Central Asia",
          "Iceland": "Europe & Central Asia",
          "India": "South Asia",
          "Indonesia": "East Asia & Pacific",
          "Islamic Republic of Iran": "Middle East & North Africa",
          "Iraq": "Middle East & North Africa",
          "Ireland": "Europe & Central Asia",
          "Israel": "Middle East & North Africa",
          "Italy": "Europe & Central Asia",
          "Jamaica": "Latin America & Caribbean",
          "Japan": "East Asia & Pacific",
          "Jordan": "Middle East & North Africa",
          "Kazakhstan": "Europe & Central Asia",
          "Kenya": "Sub-Saharan Africa",
          "Republic of Korea": "East Asia & Pacific",
          "Kuwait": "Middle East & North Africa",
          "Kyrgyzstan": "Europe & Central Asia",
          "Lao PDR": "East Asia & Pacific",
          "Latvia": "Europe & Central Asia",
          "Lebanon": "Middle East & North Africa",
          "Lesotho": "Sub-Saharan Africa",
          "Liberia": "Sub-Saharan Africa",
          "Libya": "Middle East & North Africa",
          "Lithuania": "Europe & Central Asia",
          "Luxembourg": "Europe & Central Asia",
          "Macao SAR China": "East Asia & Pacific",
          "The former Yugoslav Republic of Macedonia": "Europe & Central Asia",
          "Madagascar": "Sub-Saharan Africa",
          "Malawi": "Sub-Saharan Africa",
          "Malaysia": "East Asia & Pacific",
          "Mali": "Sub-Saharan Africa",
          "Malta": "Middle East & North Africa",
          "Mauritania": "Sub-Saharan Africa",
          "Mexico": "Latin America & Caribbean",
          "Republic of Moldova": "Europe & Central Asia",
          "Mongolia": "East Asia & Pacific",
          "Montenegro": "Europe & Central Asia",
          "Morocco": "Middle East & North Africa",
          "Mozambique": "Sub-Saharan Africa",
          "Namibia": "Sub-Saharan Africa",
          "Nepal": "South Asia",
          "Netherlands": "Europe & Central Asia",
          "New Zealand": "East Asia & Pacific",
          "Nicaragua": "Latin America & Caribbean",
          "Niger": "Sub-Saharan Africa",
          "Nigeria": "Sub-Saharan Africa",
          "Norway": "Europe & Central Asia",
          "Oman": "Middle East & North Africa",
          "Pakistan": "South Asia",
          "Palau": "East Asia & Pacific",
          "Panama": "Latin America & Caribbean",
          "Papua New Guinea": "East Asia & Pacific",
          "Paraguay": "Latin America & Caribbean",
          "Peru": "Latin America & Caribbean",
          "Philippines": "East Asia & Pacific",
          "Poland": "Europe & Central Asia",
          "Portugal": "Europe & Central Asia",
          "Qatar": "Middle East & North Africa",
          "Romania": "Europe & Central Asia",
          "Russian Federation": "Europe & Central Asia",
          "Rwanda": "Sub-Saharan Africa",
          "Saudi Arabia": "Middle East & North Africa",
          "Senegal": "Sub-Saharan Africa",
          "Serbia": "Europe & Central Asia",
          "Sierra Leone": "Sub-Saharan Africa",
          "Singapore": "East Asia & Pacific",
          "Slovakia": "Europe & Central Asia",
          "Slovenia": "Europe & Central Asia",
          "Solomon Islands": "East Asia & Pacific",
          "South Africa": "Sub-Saharan Africa",
          "South Sudan": "Sub-Saharan Africa",
          "Spain": "Europe & Central Asia",
          "Sri Lanka": "South Asia",
          "Saint Kitts and Nevis": "Latin America & Caribbean",
          "Saint Lucia": "Latin America & Caribbean",
          "Saint Vincent and the Grenadines": "Latin America & Caribbean",
          "Sudan": "Sub-Saharan Africa",
          "Suriname": "Latin America & Caribbean",
          "Swaziland": "Sub-Saharan Africa",
          "Sweden": "Europe & Central Asia",
          "Switzerland": "Europe & Central Asia",
          "Syrian Arab Republic": "Middle East & North Africa",
          "Tajikistan": "Europe & Central Asia",
          "United Republic of Tanzania": "Sub-Saharan Africa",
          "Thailand": "East Asia & Pacific",
          "Timor-Leste": "East Asia & Pacific",
          "Togo": "Sub-Saharan Africa",
          "Tonga": "East Asia & Pacific",
          "Trinidad and Tobago": "Latin America & Caribbean",
          "Tunisia": "Middle East & North Africa",
          "Turkey": "Europe & Central Asia",
          "Turkmenistan": "Europe & Central Asia",
          "Uganda": "Sub-Saharan Africa",
          "Ukraine": "Europe & Central Asia",
          "Somalia": "Sub-Saharan Africa",
          "United Arab Emirates": "Middle East & North Africa",
          "United Kingdom": "Europe & Central Asia",
          "United States": "North America",
          "Uruguay": "Latin America & Caribbean",
          "Uzbekistan": "Europe & Central Asia",
          "Vanuatu": "East Asia & Pacific",
          "Bolivarian Republic of Venezuela": "Latin America & Caribbean",
          "Yemen": "Middle East & North Africa",
          "Zambia": "Sub-Saharan Africa",
          "Zimbabwe": "Sub-Saharan Africa"
        };

      const options = {
          title: {
              text: '2013 UNHCR - Asylum Seekers\' flow over the world - Origin'
          },

        legend: {
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemWidth: 250
        },

        mapNavigation: {
          enabled: true,
          buttonOptions: {
            align: 'right',
            verticalAlign: 'bottom'
          }
        },

        tooltip: {
          formatter: function() {
            return this.point.id + (this.point.lat ? '<br>Lat: ' + this.point.lat + ' Lon: ' + this.point.lon : '');
          }
        },

        plotOptions: {
          series: {
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: Highcharts.getOptions().colors[1]
            }
          }
        },
        series: [{
              // Use the gb-all map with no data as a basemap
            mapData: Highcharts.geojson(Highcharts.maps['https://code.highcharts.com/mapdata/countries/gb/gb-all.js']), //'custom/world' //countries/gb/gb-all'
            name: 'Basemap',
            borderColor: '#707070',
            nullColor: 'rgba(200, 200, 200, 0.3)',
            showInLegend: false,
            data : []
        }, {
          mapData: mapdata,
          name: "Request Origin",
          data: [],
        },{
      // Specify points using lat/lon
      type: 'mappoint',
      name: 'Cities',
      dataLabels: {
        formatter: function() {
          return this.point.id;
        }
      },
      // Use id instead of name to allow for referencing points later
      data: [
      {
        id: 'Afghanistan',
        lat: 33.9391,
        lon: 67.71
      }, {
        id: 'Albania',
        lat: 41.1533,
        lon: 20.1683
      }, {
        id: 'Algeria',
        lat: 28.0339,
        lon: 1.65963
      }, {
        id: 'Angola',
        lat: -11.2027,
        lon: 17.8739
      }, {
        id: 'Antigua and Barbuda',
        lat: 17.0608,
        lon: -61.7964
      }, {
        id: 'Argentina',
        lat: -38.4161,
        lon: -63.6167
      }, {
        id: 'Armenia',
        lat: 40.0691,
        lon: 45.0382
      }, {
        id: 'Australia',
        lat: -25.2744,
        lon: 133.775
      }, {
        id: 'Austria',
        lat: 47.5162,
        lon: 14.5501
      }, {
        id: 'Azerbaijan',
        lat: 40.1431,
        lon: 47.5769
      }, {
        id: 'Bahamas',
        lat: 25.0343,
        lon: -77.3963
      }, {
        id: 'Bahrain',
        lat: 25.9304,
        lon: 50.6378
      }, {
        id: 'Bangladesh',
        lat: 23.685,
        lon: 90.3563
      }, {
        id: 'Barbados',
        lat: 13.1939,
        lon: -59.5432
      }, {
        id: 'Belarus',
        lat: 53.7098,
        lon: 27.9534
      }, {
        id: 'Belgium',
        lat: 50.5039,
        lon: 4.46994
      }, {
        id: 'Belize',
        lat: 17.1899,
        lon: -88.4977
      }, {
        id: 'Benin',
        lat: 9.30769,
        lon: 2.31583
      }, {
        id: 'Plurinational State of Bolivia',
        lat: -16.2902,
        lon: -63.5887
      }, {
        id: 'Bosnia and Herzegovina',
        lat: 43.9159,
        lon: 17.6791
      }, {
        id: 'Botswana',
        lat: -22.3285,
        lon: 24.6849
      }, {
        id: 'Brazil',
        lat: -14.235,
        lon: -51.9253
      }, {
        id: 'Bulgaria',
        lat: 42.7339,
        lon: 25.4858
      }, {
        id: 'Burkina Faso',
        lat: 12.2383,
        lon: -1.56159
      }, {
        id: 'Burundi',
        lat: -3.37306,
        lon: 29.9189
      }, {
        id: 'Cambodia',
        lat: 12.5657,
        lon: 104.991
      }, {
        id: 'Cameroon',
        lat: 7.36972,
        lon: 12.3547
      }, {
        id: 'Canada',
        lat: 56.1304,
        lon: -106.347
      }, {
        id: 'Central African Republic',
        lat: 6.61111,
        lon: 20.9394
      }, {
        id: 'Chad',
        lat: 15.4542,
        lon: 18.7322
      }, {
        id: 'Chile',
        lat: -35.6751,
        lon: -71.543
      }, {
        id: 'China',
        lat: 35.8617,
        lon: 104.195
      }, {
        id: 'Colombia',
        lat: 4.57087,
        lon: -74.2973
      }, {
        id: 'Democratic Republic of the Congo',
        lat: -4.03833,
        lon: 21.7587
      }, {
        id: 'Congo',
        lat: -0.228021,
        lon: 15.8277
      }, {
        id: 'Costa Rica',
        lat: 9.74892,
        lon: -83.7534
      }, {
        id: "Ivory Coast",
        lat: 7.53999,
        lon: -5.54708
      }, {
        id: 'Croatia',
        lat: 45.1,
        lon: 15.2
      }, {
        id: 'Cyprus',
        lat: 35.1264,
        lon: 33.4299
      }, {
        id: 'Czech Republic',
        lat: 49.8175,
        lon: 15.473
      }, {
        id: 'Denmark',
        lat: 56.2639,
        lon: 9.50179
      }, {
        id: 'Djibouti',
        lat: 11.8251,
        lon: 42.5903
      }, {
        id: 'Dominica',
        lat: 15.415,
        lon: -61.371
      }, {
        id: 'Dominican Republic',
        lat: 18.7357,
        lon: -70.1627
      }, {
        id: 'Ecuador',
        lat: -1.83124,
        lon: -78.1834
      }, {
        id: 'Egypt',
        lat: 26.8206,
        lon: 30.8025
      }, {
        id: 'El Salvador',
        lat: 13.7942,
        lon: -88.8965
      }, {
        id: 'Eritrea',
        lat: 15.1794,
        lon: 39.7823
      }, {
        id: 'Estonia',
        lat: 58.5953,
        lon: 25.0136
      }, {
        id: 'Ethiopia',
        lat: 9.145,
        lon: 40.4897
      }, {
        id: 'Fiji',
        lat: -16.5782,
        lon: 179.414
      }, {
        id: 'Finland',
        lat: 61.9241,
        lon: 25.7482
      }, {
        id: 'France',
        lat: 46.2276,
        lon: 2.21375
      }, {
        id: 'Gabon',
        lat: -0.803689,
        lon: 11.6094
      }, {
        id: 'Gambia',
        lat: 13.4432,
        lon: -15.3101
      }, {
        id: 'Georgia',
        lat: 42.3154,
        lon: 43.3569
      }, {
        id: 'Germany',
        lat: 51.1657,
        lon: 10.4515
      }, {
        id: 'Ghana',
        lat: 7.94653,
        lon: -1.02319
      }, {
        id: 'Greece',
        lat: 39.0742,
        lon: 21.8243
      }, {
        id: 'Grenada',
        lat: 12.2628,
        lon: -61.6042
      }, {
        id: 'Guatemala',
        lat: 15.7835,
        lon: -90.2308
      }, {
        id: 'Guinea',
        lat: 9.94559,
        lon: -9.69664
      }, {
        id: 'Guinea-Bissau',
        lat: 11.8037,
        lon: -15.1804
      }, {
        id: 'Guyana',
        lat: 4.86042,
        lon: -58.9302
      }, {
        id: 'Haiti',
        lat: 18.9712,
        lon: -72.2852
      }, {
        id: 'Honduras',
        lat: 15.2,
        lon: -86.2419
      }, {
        id: 'Hong Kong SAR, China',
        lat: 22.3964,
        lon: 114.109
      }, {
        id: 'Hungary',
        lat: 47.1625,
        lon: 19.5033
      }, {
        id: 'Iceland',
        lat: 64.9631,
        lon: -19.0208
      }, {
        id: 'India',
        lat: 20.5937,
        lon: 78.9629
      }, {
        id: 'Indonesia',
        lat: -0.789275,
        lon: 113.921
      }, {
        id: 'Islamic Republic of Iran',
        lat: 32.4279,
        lon: 53.688
      }, {
        id: 'Iraq',
        lat: 33.2232,
        lon: 43.6793
      }, {
        id: 'Ireland',
        lat: 53.4129,
        lon: -8.24389
      }, {
        id: 'Israel',
        lat: 31.0461,
        lon: 34.8516
      }, {
        id: 'Italy',
        lat: 41.8719,
        lon: 12.5674
      }, {
        id: 'Jamaica',
        lat: 18.1096,
        lon: -77.2975
      }, {
        id: 'Japan',
        lat: 36.2048,
        lon: 138.253
      }, {
        id: 'Jordan',
        lat: 30.5852,
        lon: 36.2384
      }, {
        id: 'Kazakhstan',
        lat: 48.0196,
        lon: 66.9237
      }, {
        id: 'Kenya',
        lat: -0.023559,
        lon: 37.9062
      }, {
        id: 'Republic of Korea',
        lat: 35.9078,
        lon: 127.767
      }, {
        id: 'Kuwait',
        lat: 29.3117,
        lon: 47.4818
      }, {
        id: 'Kyrgyzstan',
        lat: 41.2044,
        lon: 74.7661
      }, {
        id: 'Lao PDR',
        lat: 19.8563,
        lon: 102.495
      }, {
        id: 'Latvia',
        lat: 56.8796,
        lon: 24.6032
      }, {
        id: 'Lebanon',
        lat: 33.8547,
        lon: 35.8623
      }, {
        id: 'Lesotho',
        lat: -29.61,
        lon: 28.2336
      }, {
        id: 'Liberia',
        lat: 6.42805,
        lon: -9.4295
      }, {
        id: 'Libya',
        lat: 26.3351,
        lon: 17.2283
      }, {
        id: 'Lithuania',
        lat: 55.1694,
        lon: 23.8813
      }, {
        id: 'Luxembourg',
        lat: 49.8153,
        lon: 6.12958
      }, {
        id: 'Macao SAR, China',
        lat: 22.1987,
        lon: 113.544
      }, {
        id: 'The former Yugoslav Republic of Macedonia',
        lat: 41.6086,
        lon: 21.7453
      }, {
        id: 'Madagascar',
        lat: -18.7669,
        lon: 46.8691
      }, {
        id: 'Malawi',
        lat: -13.2543,
        lon: 34.3015
      }, {
        id: 'Malaysia',
        lat: 4.21048,
        lon: 101.976
      }, {
        id: 'Mali',
        lat: 17.5707,
        lon: -3.99617
      }, {
        id: 'Malta',
        lat: 35.9375,
        lon: 14.3754
      }, {
        id: 'Mauritania',
        lat: 21.0079,
        lon: -10.9408
      }, {
        id: 'Mexico',
        lat: 23.6345,
        lon: -102.553
      }, {
        id: 'Republic of Moldova',
        lat: 47.4116,
        lon: 28.3699
      }, {
        id: 'Mongolia',
        lat: 46.8625,
        lon: 103.847
      }, {
        id: 'Montenegro',
        lat: 42.7087,
        lon: 19.3744
      }, {
        id: 'Morocco',
        lat: 31.7917,
        lon: -7.09262
      }, {
        id: 'Mozambique',
        lat: -18.6657,
        lon: 35.5296
      }, {
        id: 'Namibia',
        lat: -22.9576,
        lon: 18.4904
      }, {
        id: 'Nepal',
        lat: 28.3949,
        lon: 84.124
      }, {
        id: 'Netherlands',
        lat: 52.1326,
        lon: 5.29127
      }, {
        id: 'New Zealand',
        lat: -40.9006,
        lon: 174.886
      }, {
        id: 'Nicaragua',
        lat: 12.8654,
        lon: -85.2072
      }, {
        id: 'Niger',
        lat: 17.6078,
        lon: 8.08167
      }, {
        id: 'Nigeria',
        lat: 9.082,
        lon: 8.67528
      }, {
        id: 'Norway',
        lat: 60.472,
        lon: 8.46895
      }, {
        id: 'Oman',
        lat: 21.5126,
        lon: 55.9233
      }, {
        id: 'Pakistan',
        lat: 30.3753,
        lon: 69.3451
      }, {
        id: 'Palau',
        lat: 7.51498,
        lon: 134.583
      }, {
        id: 'Panama',
        lat: 8.53798,
        lon: -80.7821
      }, {
        id: 'Papua New Guinea',
        lat: -6.31499,
        lon: 143.956
      }, {
        id: 'Paraguay',
        lat: -23.4425,
        lon: -58.4438
      }, {
        id: 'Peru',
        lat: -9.18997,
        lon: -75.0152
      }, {
        id: 'Philippines',
        lat: 12.8797,
        lon: 121.774
      }, {
        id: 'Poland',
        lat: 51.9194,
        lon: 19.1451
      }, {
        id: 'Portugal',
        lat: 39.3999,
        lon: -8.22445
      }, {
        id: 'Qatar',
        lat: 25.3548,
        lon: 51.1839
      }, {
        id: 'Romania',
        lat: 45.9432,
        lon: 24.9668
      }, {
        id: 'Russian Federation',
        lat: 61.524,
        lon: 105.319
      }, {
        id: 'Rwanda',
        lat: -1.94028,
        lon: 29.8739
      }, {
        id: 'Saudi Arabia',
        lat: 23.8859,
        lon: 45.0792
      }, {
        id: 'Senegal',
        lat: 14.4974,
        lon: -14.4524
      }, {
        id: 'Serbia',
        lat: 44.0165,
        lon: 21.0059
      }, {
        id: 'Sierra Leone',
        lat: 8.46056,
        lon: -11.7799
      }, {
        id: 'Singapore',
        lat: 1.35208,
        lon: 103.82
      }, {
        id: 'Slovakia',
        lat: 48.669,
        lon: 19.699
      }, {
        id: 'Slovenia',
        lat: 46.1512,
        lon: 14.9955
      }, {
        id: 'Solomon Islands',
        lat: -9.64571,
        lon: 160.156
      }, {
        id: 'South Africa',
        lat: -30.5595,
        lon: 22.9375
      }, {
        id: 'South Sudan',
        lat: 4.859363,
        lon: 31.571251
      }, {
        id: 'Spain',
        lat: 40.4637,
        lon: -3.74922
      }, {
        id: 'Sri Lanka',
        lat: 7.87305,
        lon: 80.7718
      }, {
        id: 'Saint Kitts and Nevis',
        lat: 17.3578,
        lon: -62.783
      }, {
        id: 'Saint Lucia',
        lat: 13.9094,
        lon: -60.9789
      }, {
        id: 'Saint Vincent and the Grenadines',
        lat: 12.9843,
        lon: -61.2872
      }, {
        id: 'Sudan',
        lat: 12.8628,
        lon: 30.2176
      }, {
        id: 'Suriname',
        lat: 3.91931,
        lon: -56.0278
      }, {
        id: 'Swaziland',
        lat: -26.5225,
        lon: 31.4659
      }, {
        id: 'Sweden',
        lat: 60.1282,
        lon: 18.6435
      }, {
        id: 'Switzerland',
        lat: 46.8182,
        lon: 8.22751
      }, {
        id: 'Syrian Arab Republic',
        lat: 34.8021,
        lon: 38.9968
      }, {
        id: 'Tajikistan',
        lat: 38.861,
        lon: 71.2761
      }, {
        id: 'United Republic of Tanzania',
        lat: -6.36903,
        lon: 34.8888
      }, {
        id: 'Thailand',
        lat: 15.87,
        lon: 100.993
      }, {
        id: 'Timor-Leste',
        lat: -8.87422,
        lon: 125.728
      }, {
        id: 'Togo',
        lat: 8.61954,
        lon: 0.824782
      }, {
        id: 'Tonga',
        lat: -21.179,
        lon: -175.198
      }, {
        id: 'Trinidad and Tobago',
        lat: 10.6918,
        lon: -61.2225
      }, {
        id: 'Tunisia',
        lat: 33.8869,
        lon: 9.5375
      }, {
        id: 'Turkey',
        lat: 38.9637,
        lon: 35.2433
      }, {
        id: 'Turkmenistan',
        lat: 38.9697,
        lon: 59.5563
      }, {
        id: 'Uganda',
        lat: 1.37333,
        lon: 32.2903
      }, {
        id: 'Ukraine',
        lat: 48.3794,
        lon: 31.1656
      }, {
        id: 'Somalia',
        lat: 2.0469343,
        lon: 45.3181623
      }, {
        id: 'United Arab Emirates',
        lat: 23.4241,
        lon: 53.8478
      }, {
        id: 'United Kingdom',
        lat: 55.3781,
        lon: -3.43597
      }, {
        id: 'United States',
        lat: 37.0902,
        lon: -95.7129
      }, {
        id: 'Uruguay',
        lat: -32.5228,
        lon: -55.7658
      }, {
        id: 'Uzbekistan',
        lat: 41.3775,
        lon: 64.5853
      }, {
        id: 'Vanuatu',
        lat: -15.3767,
        lon: 166.959
      }, {
        id: 'Bolivarian Republic of Venezuela',
        lat: 6.42375,
        lon: -66.5897
      }, {
        id: 'Yemen',
        lat: 15.5527,
        lon: 48.5164
      }, {
        id: 'Zambia',
        lat: -13.1339,
        lon: 27.8493
      }, {
        id: 'Zimbabwe',
        lat: -19.0154,
        lon: 29.1549
      }],
      visible: true
    }]
    };
    return (
      <Fragment>
            <HighchartsReact
              constructorType={"mapChart"}
              allowChartUpdate={true}
              highcharts={Highcharts}
              ref={"chart"}
              options={options}
            />
      </Fragment>
    );
  }
}

export default IncidentThreatOrigin;
