
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Check, Ruler, Info, MapPin, Loader2, Navigation, Layers, AlertCircle, Search, Crosshair } from 'lucide-react';
import { Coordinate, Field } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface FieldMappingProps {
  onSaveField: (field: Field) => void;
}

export const FieldMapping: React.FC<FieldMappingProps> = ({ onSaveField }) => {
  const { t } = useLanguage();
  const [fieldName, setFieldName] = useState('');
  const [calculatedArea, setCalculatedArea] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapType, setMapType] = useState<'schematic' | 'satellite'>('schematic');
  const [hasPoints, setHasPoints] = useState(false);
  
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // OpenLayers Map instance
  const vectorSourceRef = useRef<any>(null); // Source for drawn features
  const osmLayerRef = useRef<any>(null);
  const satelliteLayerRef = useRef<any>(null);
  const userLocationLayerRef = useRef<any>(null); // Layer for blue dot

  // Initialize OpenLayers Map
  useEffect(() => {
    if (!mapElement.current) return;
    if (mapRef.current) return; // Prevent double init

    const ol = (window as any).ol;
    if (!ol) {
        console.error("OpenLayers not loaded");
        return;
    }

    // Default View (Tashkent)
    const tashkentCoords = ol.proj.fromLonLat([69.2401, 41.2995]);

    // Layers
    const osmSource = new ol.source.OSM();
    osmLayerRef.current = new ol.layer.Tile({
        source: osmSource,
        visible: true
    });

    const satelliteSource = new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri',
        maxZoom: 19
    });
    satelliteLayerRef.current = new ol.layer.Tile({
        source: satelliteSource,
        visible: false
    });

    // Vector Layer for Drawing
    vectorSourceRef.current = new ol.source.Vector({ wrapX: false });
    const vectorLayer = new ol.layer.Vector({
        source: vectorSourceRef.current,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(34, 197, 94, 0.3)' // yield-500 with opacity
            }),
            stroke: new ol.style.Stroke({
                color: '#16a34a', // yield-600
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffffff'
                }),
                stroke: new ol.style.Stroke({
                    color: '#16a34a',
                    width: 2
                })
            })
        })
    });

    // Vector Layer for User Location (Blue Dot)
    const userLocationSource = new ol.source.Vector();
    userLocationLayerRef.current = new ol.layer.Vector({
        source: userLocationSource,
        zIndex: 100
    });

    // Create Map
    const map = new ol.Map({
        target: mapElement.current,
        layers: [
            osmLayerRef.current,
            satelliteLayerRef.current,
            vectorLayer,
            userLocationLayerRef.current
        ],
        view: new ol.View({
            center: tashkentCoords,
            zoom: 13
        }),
        controls: ol.control.defaults.defaults({
            attribution: false,
            zoom: false // We use custom buttons or pinch
        })
    });

    // Add Interaction (Draw Polygon)
    const draw = new ol.interaction.Draw({
        source: vectorSourceRef.current,
        type: 'Polygon',
        // Style for the drawing line while dragging
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#16a34a', // yield-600
                width: 2,
                lineDash: [10, 10]
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: '#16a34a'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });

    draw.on('drawstart', () => {
        // Clear previous drawings when starting a new one
        vectorSourceRef.current.clear();
        setCalculatedArea(0);
        setHasPoints(false);
    });

    draw.on('drawend', (event: any) => {
        const polygon = event.feature.getGeometry();
        calculateArea(polygon);
        setHasPoints(true);
    });

    map.addInteraction(draw);
    mapRef.current = map;

    // Try locate user initially
    locateUser();

    // Resize Observer to fix any container size issues
    const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
            mapRef.current.updateSize();
        }
    });
    resizeObserver.observe(mapElement.current);

    return () => {
        resizeObserver.disconnect();
        map.setTarget(undefined);
    };
  }, []);

  // Effect to toggle layers
  useEffect(() => {
    if (!osmLayerRef.current || !satelliteLayerRef.current) return;
    
    if (mapType === 'schematic') {
        osmLayerRef.current.setVisible(true);
        satelliteLayerRef.current.setVisible(false);
    } else {
        osmLayerRef.current.setVisible(false);
        satelliteLayerRef.current.setVisible(true);
    }
  }, [mapType]);

  const calculateArea = (polygonGeometry: any) => {
      const ol = (window as any).ol;
      // Get area in square meters using geodesic calculation
      const area = ol.sphere.getArea(polygonGeometry, { projection: 'EPSG:3857' });
      const areaHa = area / 10000;
      setCalculatedArea(areaHa);
  };

  const locateUser = () => {
    if (!mapRef.current) return;
    const ol = (window as any).ol;
    setIsLocating(true);
    setGpsError(false);

    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        setGpsError(true);
        setIsLocating(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = ol.proj.fromLonLat([longitude, latitude]);
        
        mapRef.current.getView().animate({
            center: coords,
            zoom: 17,
            duration: 1000
        });

        // Add Blue Dot
        const userFeature = new ol.Feature({
            geometry: new ol.geom.Point(coords)
        });
        
        userFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: '#3b82f6' }), // Blue
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        }));

        if (userLocationLayerRef.current) {
            userLocationLayerRef.current.getSource().clear();
            userLocationLayerRef.current.getSource().addFeature(userFeature);
        }

        setIsLocating(false);
        setGpsError(false);
      },
      (error) => {
        // Improved error handling
        let errorMessage = "Unknown error";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                errorMessage = "The request to get user location timed out.";
                break;
            default:
                errorMessage = error.message;
        }
        console.error("Error getting location:", errorMessage);
        setIsLocating(false);
        setGpsError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManualSearch = async () => {
    if (!searchQuery || !mapRef.current) return;
    const ol = (window as any).ol;
    setIsSearching(true);
    setGpsError(false);

    // Check coords
    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[3]);
        const coords = ol.proj.fromLonLat([lng, lat]);
        mapRef.current.getView().animate({ center: coords, zoom: 17 });
        setIsSearching(false);
        return;
    }

    // Nominatim
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const coords = ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]);
            
            mapRef.current.getView().animate({ center: coords, zoom: 16 });

            // Add Pin
            const searchFeature = new ol.Feature({
                geometry: new ol.geom.Point(coords)
            });
            searchFeature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Simple pin icon
                    scale: 0.05,
                    anchor: [0.5, 1]
                })
            }));
            
            // Re-use user location layer for temporary search pin
            userLocationLayerRef.current.getSource().clear();
            userLocationLayerRef.current.getSource().addFeature(searchFeature);

        } else {
            alert(t.mapping?.enterNameAlert || "Location not found");
        }
    } catch (e) {
        console.error("Search error", e);
    } finally {
        setIsSearching(false);
    }
  };

  const resetMap = () => {
    if (vectorSourceRef.current) {
        vectorSourceRef.current.clear();
    }
    setCalculatedArea(0);
    setHasPoints(false);
    setFieldName('');
  };

  const saveField = () => {
    if (!fieldName) {
      alert(t.mapping.enterNameAlert);
      return;
    }
    if (calculatedArea <= 0) {
        alert("Please draw a field area first.");
        return;
    }

    const ol = (window as any).ol;
    
    // Extract coordinates to save (convert back to Lat/Lng)
    const features = vectorSourceRef.current.getFeatures();
    if (features.length === 0) return;
    
    const geometry = features[0].getGeometry();
    const coordinates = geometry.getCoordinates(); // This is typically [ [ [x,y], [x,y] ... ] ] for polygons
    
    // Flatten and convert
    // OpenLayers Polygons are arrays of rings. The first ring is the outer boundary.
    const ring = coordinates[0]; 
    const savedPoints: Coordinate[] = ring.map((pt: any) => {
        const lonLat = ol.proj.toLonLat(pt);
        return { lat: lonLat[1], lng: lonLat[0] };
    });

    const newField: Field = {
      id: Date.now().toString(),
      name: fieldName,
      areaHa: Number(calculatedArea.toFixed(4)),
      coordinates: savedPoints,
      plantingDate: new Date().toISOString().split('T')[0]
    };

    onSaveField(newField);
    resetMap();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Ruler className="text-yield-600" />
              {t.mapping.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                {gpsError ? (
                     <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
                         <AlertCircle size={12} />
                         GPS ERROR
                     </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                         <Crosshair size={12} />
                         GPS READY
                     </span>
                )}
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t.mapping.desc}
                </p>
            </div>
          </div>
          <div className="self-end md:self-auto text-right bg-yield-50 dark:bg-yield-900/30 px-4 py-2 rounded-lg md:bg-transparent md:p-0">
             <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.mapping.areaLabel}</div>
             <div className="text-2xl md:text-3xl font-bold text-yield-600 dark:text-yield-400">
               {calculatedArea.toFixed(2)} <span className="text-sm text-slate-400">га</span>
             </div>
          </div>
        </div>

        {/* Search Bar for Manual Location */}
        <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Address or Coordinates (lat, lng)..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-yield-900/20 border border-slate-300 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-yield-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button 
                onClick={handleManualSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-slate-200 dark:bg-yield-800 text-slate-700 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-yield-700 transition-colors"
            >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
        </div>

        {/* OpenLayers Map Container */}
        <div className="relative rounded-xl overflow-hidden border-2 border-slate-300 dark:border-yield-900 h-[60vh] md:h-[500px] shadow-inner group w-full">
            <div ref={mapElement} className="w-full h-full bg-slate-100" />
            
            {/* Map Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-[100] flex flex-col gap-2">
                <button 
                    onClick={() => setMapType(prev => prev === 'schematic' ? 'satellite' : 'schematic')}
                    className="bg-white dark:bg-yield-900 text-slate-700 dark:text-white p-3 rounded-full shadow-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 active:scale-95 transition-all"
                    title="Toggle Layer"
                >
                    <Layers size={20} />
                </button>
                <button 
                    onClick={locateUser}
                    className={`bg-white dark:bg-yield-900 p-3 rounded-full shadow-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 active:scale-95 transition-all ${gpsError ? 'text-red-500' : 'text-slate-700 dark:text-white'}`}
                    title="Find My Location"
                >
                    {isLocating ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                </button>
            </div>

            {!hasPoints && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-max max-w-[90%] text-center">
                    <span className="bg-white/90 dark:bg-black/70 px-4 py-2 rounded-full text-sm font-medium shadow-md text-slate-700 dark:text-white backdrop-blur-sm flex items-center justify-center gap-2">
                        <MapPin size={16} /> {t.mapping.clickToAdd}
                    </span>
                 </div>
            )}
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.mapping.fieldNameLabel}</label>
            <input 
              type="text" 
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder={t.mapping.fieldNamePlaceholder}
              className="w-full px-4 py-3 md:py-2 bg-white dark:bg-yield-900/20 border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-900 dark:text-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <button 
               onClick={resetMap}
               className="flex-1 md:flex-none px-6 py-3 md:py-2.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 font-medium active:scale-[0.98] transition-all"
             >
               <Trash2 size={18} /> {t.common.delete}
             </button>
             <button 
               onClick={saveField}
               disabled={!hasPoints}
               className={`flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-[0.98] ${
                 !hasPoints 
                   ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                   : 'bg-yield-600 hover:bg-yield-700 shadow-lg shadow-yield-900/20'
               }`}
             >
               <Check size={18} /> {t.common.save}
             </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
         <Info className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
         <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">{t.mapping.droneIntegration}</h4>
            <p className="text-blue-700 dark:text-blue-200/70 text-sm mt-1">
               {t.mapping.droneIntegrationDesc}
            </p>
         </div>
      </div>
    </div>
  );
};
