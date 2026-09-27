// Copy this code and paste in console by clicking F12 inside your working GeoFS.

(async () => {
    try {
        console.log("🌍 GeoFS → Esri World Imagery");

        // ---------------------------------------------------------
        // 1. Find GeoFS Cesium viewer
        // ---------------------------------------------------------
        const viewer =
            window.geofs?.api?.viewer ||
            window.geofs?.ceViewer ||
            window.geofs?.viewer ||
            window.viewer;

        if (!viewer?.scene) {
            throw new Error("Could not find the active GeoFS Cesium viewer.");
        }

        console.log("✅ Cesium viewer found:", viewer);

        // ---------------------------------------------------------
        // 2. Find Cesium namespace
        // ---------------------------------------------------------
        const Cesium =
            window.Cesium ||
            window.geofs?.api?.Cesium;

        if (!Cesium) {
            throw new Error("Cesium namespace not found.");
        }

        // ---------------------------------------------------------
        // 3. Save existing layers so we can restore later
        // ---------------------------------------------------------
        const layers = viewer.imageryLayers || viewer.scene.imageryLayers;

        if (!layers) {
            throw new Error("Cesium imageryLayers collection not found.");
        }

        window.__GEOFS_ORIGINAL_LAYERS = [];

        for (let i = 0; i < layers.length; i++) {
            window.__GEOFS_ORIGINAL_LAYERS.push(layers.get(i));
        }

        console.log(
            `✅ Saved ${window.__GEOFS_ORIGINAL_LAYERS.length} existing imagery layer(s).`
        );

        // ---------------------------------------------------------
        // 4. Remove existing imagery
        // ---------------------------------------------------------
        layers.removeAll(false);

        console.log("✅ Existing ground imagery hidden.");

        // ---------------------------------------------------------
        // 5. Create Esri World Imagery provider
        // ---------------------------------------------------------
        const esriProvider = new Cesium.UrlTemplateImageryProvider({
            url:
                "https://server.arcgisonline.com/ArcGIS/rest/services/" +
                "World_Imagery/MapServer/tile/{z}/{y}/{x}",

            maximumLevel: 19,

            credit:
                "Esri, Maxar, Earthstar Geographics, and the GIS User Community",

            enablePickFeatures: false
        });

        // ---------------------------------------------------------
        // 6. Add Esri imagery
        // ---------------------------------------------------------
        const esriLayer = layers.addImageryProvider(esriProvider);

        window.__GEOFS_ESRI_LAYER = esriLayer;

        console.log("✅ Esri World Imagery added.");

        // ---------------------------------------------------------
        // 7. Slight image tuning
        // ---------------------------------------------------------
        esriLayer.brightness = 1.02;
        esriLayer.contrast = 1.08;
        esriLayer.saturation = 1.05;
        esriLayer.gamma = 1.0;

        console.log("✅ Imagery enhancement applied.");

        // ---------------------------------------------------------
        // 8. Rendering quality
        // ---------------------------------------------------------
        if ("resolutionScale" in viewer) {
            viewer.resolutionScale = 1.35;
            console.log("✅ Cesium supersampling: 1.35×");
        }

        if (viewer.scene.postProcessStages?.fxaa) {
            viewer.scene.postProcessStages.fxaa.enabled = true;
            console.log("✅ FXAA enabled.");
        }

        if ("msaaSamples" in viewer.scene) {
            try {
                viewer.scene.msaaSamples = 4;
                console.log("✅ MSAA: 4×");
            } catch (e) {
                console.warn("⚠️ MSAA unavailable:", e);
            }
        }

        // ---------------------------------------------------------
        // 9. Redraw
        // ---------------------------------------------------------
        viewer.scene.requestRender?.();

        console.log(
            "%c✅ ESRI WORLD IMAGERY ACTIVE",
            "color:#00ff88;font-size:16px;font-weight:bold"
        );

        console.log(
            "Restore original imagery with: window.restoreGeoFSMap()"
        );

        // ---------------------------------------------------------
        // Restore function
        // ---------------------------------------------------------
        window.restoreGeoFSMap = () => {
            try {
                layers.removeAll(false);

                for (const layer of window.__GEOFS_ORIGINAL_LAYERS || []) {
                    layers.add(layer);
                }

                viewer.scene.requestRender?.();

                console.log("✅ Original GeoFS imagery restored.");
            } catch (e) {
                console.error("❌ Restore failed:", e);
            }
        };

    } catch (error) {
        console.error("❌ Esri imagery replacement failed:", error);
    }
})();
