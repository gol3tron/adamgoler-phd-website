/**
 * Aircraft Performance Calculator Logic
 * Ported from Python/Streamlit app
 */

// ==========================================
// DATA TABLES (from tables_172S.py)
// ==========================================

const Tables = {
    // Short field takeoff distance
    weight_index: [2550, 2400, 2200], // Descending
    temperature_index: [0, 10, 20, 30, 40],
    pressure_altitude_index: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], // 0 to 8000 step 1000
    lift_off_index: [51, 48, 44],
    speed_at_50_feet_index: [56, 54, 50],

    // Ground roll table [weight][temp][pressure_alt]
    sfto_ground_roll: [
        // 2550 pounds
        [
            [860, 940, 1025, 1125, 1235, 1355, 1495, 1645, 1820],
            [925, 1010, 1110, 1215, 1335, 1465, 1615, 1785, 1970],
            [995, 1090, 1195, 1310, 1440, 1585, 1745, 1920, 2120],
            [1070, 1170, 1285, 1410, 1550, 1705, 1875, 2065, 2280],
            [1150, 1260, 1380, 1515, 1660, 1825, 2010, 2215, 2450],
        ],
        // 2400 pounds
        [
            [745, 810, 885, 970, 1065, 1170, 1285, 1415, 1560],
            [800, 875, 955, 1050, 1150, 1265, 1390, 1530, 1690],
            [860, 940, 1030, 1130, 1240, 1360, 1500, 1650, 1815],
            [925, 1010, 1110, 1215, 1335, 1465, 1610, 1770, 1950],
            [995, 1085, 1190, 1305, 1430, 1570, 1725, 1900, 2095],
        ],
        // 2200 pounds
        [
            [610, 665, 725, 795, 870, 955, 1050, 1150, 1270],
            [655, 720, 785, 860, 940, 1030, 1130, 1245, 1370],
            [705, 770, 845, 925, 1010, 1110, 1220, 1340, 1475],
            [760, 830, 905, 995, 1090, 1195, 1310, 1435, 1580],
            [815, 890, 975, 1065, 1165, 1275, 1400, 1540, 1695],
        ],
    ],

    sfto_dist_50_feet: [
        // 2550 pounds
        [
            [1465, 1600, 1755, 1925, 2120, 2345, 2605, 2910, 3265],
            [1575, 1720, 1890, 2080, 2295, 2545, 2830, 3170, 3575],
            [1690, 1850, 2035, 2240, 2480, 2755, 3075, 3440, 3880],
            [1810, 1990, 2190, 2420, 2685, 2975, 3320, 3730, 4225],
            [1945, 2135, 2355, 2605, 2880, 3205, 3585, 4045, 4615],
        ],
        // 2400 pounds
        [
            [1275, 1390, 1520, 1665, 1830, 2015, 2230, 2470, 2755],
            [1370, 1495, 1635, 1795, 1975, 2180, 2410, 2685, 3000],
            [1470, 1605, 1760, 1930, 2130, 2355, 2610, 2900, 3240],
            [1570, 1720, 1890, 2080, 2295, 2530, 2805, 3125, 3500],
            [1685, 1845, 2030, 2230, 2455, 2715, 3015, 3370, 3790],
        ],
        // 2200 pounds
        [
            [1055, 1145, 1250, 1365, 1490, 1635, 1800, 1985, 2195],
            [1130, 1230, 1340, 1465, 1605, 1765, 1940, 2145, 2375],
            [1205, 1315, 1435, 1570, 1725, 1900, 2090, 2305, 2555],
            [1290, 1410, 1540, 1685, 1855, 2035, 2240, 2475, 2745],
            [1380, 1505, 1650, 1805, 1975, 2175, 2395, 2650, 2950],
        ],
    ],
    
    // Cruise Data
    cruise_pressure_altitudes: [2000, 4000, 6000, 8000, 10000, 12000],
    cruise_temperatures: [15, 5],
    cruise_rpms: [2200, 2300, 2400, 2500],
    
    // [altitude][temperature][rpm]
    cruise_true_airspeed_no_mp: [
        [[113, 118, 123, 128], [116, 121, 126, 131]],
        [[118, 123, 128, 133], [121, 126, 131, 136]],
        [[123, 128, 133, 138], [126, 131, 136, 141]],
        [[128, 133, 138, 143], [131, 136, 141, 146]],
        [[133, 138, 143, 148], [136, 141, 146, 151]],
        [[138, 143, 148, 153], [141, 146, 151, 156]],
    ],
    
    cruise_fuel_flow_no_mp: [
        [[8.9, 9.6, 10.3, 11.0], [8.7, 9.4, 10.1, 10.8]],
        [[8.7, 9.4, 10.1, 10.8], [8.5, 9.2, 9.9, 10.6]],
        [[8.5, 9.2, 9.9, 10.6], [8.3, 9.0, 9.7, 10.4]],
        [[8.3, 9.0, 9.7, 10.4], [8.1, 8.8, 9.5, 10.2]],
        [[8.1, 8.8, 9.5, 10.2], [7.9, 8.6, 9.3, 10.0]],
        [[7.9, 8.6, 9.3, 10.0], [7.7, 8.4, 9.1, 9.8]],
    ]
};

// ==========================================
// INTERPOLATION UTILS
// ==========================================

function findInterval(grid, value) {
    // Returns [index, weight]
    // Handles both ascending and descending grids
    const n = grid.length;
    const isAscending = grid[n-1] > grid[0];
    
    if (isAscending) {
        if (value <= grid[0]) return [0, 0];
        if (value >= grid[n-1]) return [n-2, 1];
        
        for (let i = 0; i < n - 1; i++) {
            if (value >= grid[i] && value <= grid[i+1]) {
                const weight = (value - grid[i]) / (grid[i+1] - grid[i]);
                return [i, weight];
            }
        }
    } else {
        // Descending
        if (value >= grid[0]) return [0, 0];
        if (value <= grid[n-1]) return [n-2, 1];
        
        for (let i = 0; i < n - 1; i++) {
            if (value <= grid[i] && value >= grid[i+1]) {
                const weight = (value - grid[i]) / (grid[i+1] - grid[i]);
                return [i, weight];
            }
        }
    }
    return [0, 0]; // Should not happen
}

function interpn3D(grids, values, point) {
    // grids: [x_grid, y_grid, z_grid]
    // values: 3D array [x][y][z]
    // point: [x, y, z]
    
    const [idx0, w0] = findInterval(grids[0], point[0]);
    const [idx1, w1] = findInterval(grids[1], point[1]);
    const [idx2, w2] = findInterval(grids[2], point[2]);
    
    // 8 corners
    const c000 = values[idx0][idx1][idx2];
    const c001 = values[idx0][idx1][idx2+1];
    const c010 = values[idx0][idx1+1][idx2];
    const c011 = values[idx0][idx1+1][idx2+1];
    const c100 = values[idx0+1][idx1][idx2];
    const c101 = values[idx0+1][idx1][idx2+1];
    const c110 = values[idx0+1][idx1+1][idx2];
    const c111 = values[idx0+1][idx1+1][idx2+1];
    
    // Interpolate along dim 2 (z)
    const c00 = c000 * (1-w2) + c001 * w2;
    const c01 = c010 * (1-w2) + c011 * w2;
    const c10 = c100 * (1-w2) + c101 * w2;
    const c11 = c110 * (1-w2) + c111 * w2;
    
    // Interpolate along dim 1 (y)
    const c0 = c00 * (1-w1) + c01 * w1;
    const c1 = c10 * (1-w1) + c11 * w1;
    
    // Interpolate along dim 0 (x)
    return c0 * (1-w0) + c1 * w0;
}

function interpn1D(grid, values, point) {
    const [idx, w] = findInterval(grid, point);
    return values[idx] * (1-w) + values[idx+1] * w;
}

function interpn3D_Cruise(grids, values, point) {
    // grids: [alt, temp, rpm]
    // values: [alt][temp][rpm]
    // point: [alt, temp, rpm]
    
    const [idx0, w0] = findInterval(grids[0], point[0]);
    const [idx1, w1] = findInterval(grids[1], point[1]);
    const [idx2, w2] = findInterval(grids[2], point[2]);
    
    const c000 = values[idx0][idx1][idx2];
    const c001 = values[idx0][idx1][idx2+1];
    const c010 = values[idx0][idx1+1][idx2];
    const c011 = values[idx0][idx1+1][idx2+1];
    const c100 = values[idx0+1][idx1][idx2];
    const c101 = values[idx0+1][idx1][idx2+1];
    const c110 = values[idx0+1][idx1+1][idx2];
    const c111 = values[idx0+1][idx1+1][idx2+1];
    
    const c00 = c000 * (1-w2) + c001 * w2;
    const c01 = c010 * (1-w2) + c011 * w2;
    const c10 = c100 * (1-w2) + c101 * w2;
    const c11 = c110 * (1-w2) + c111 * w2;
    
    const c0 = c00 * (1-w1) + c01 * w1;
    const c1 = c10 * (1-w1) + c11 * w1;
    
    return c0 * (1-w0) + c1 * w0;
}


// ==========================================
// CALCULATOR FUNCTIONS
// ==========================================

const Calculator = {
    getPressureAltitude: function(altimeter, trueAltitude) {
        return (29.92 - altimeter) * 1000 + trueAltitude;
    },

    getWindRunwayModifier: function(runwayHeading, windSpeed, windDirection) {
        const windRunwayDiff = (runwayHeading - windDirection) % 360;
        const rad = Math.PI / 180;
        const windComponent = windSpeed * Math.cos(rad * windRunwayDiff);
        
        if (windComponent > 0) { // Headwind
            return 1 - windComponent * (0.1 / 9);
        } else if (windComponent < 0) { // Tailwind
            return 1 + Math.abs(windComponent) * (0.1 / 2);
        }
        return 1;
    },

    getGrassModifier: function(isGrass) {
        return isGrass ? 1.15 : 1;
    },

    calculateTakeoff: function(params) {
        const {
            weight, temperature, altimeter, altitude, 
            runwayHeading, windDirection, windSpeed, isGrass
        } = params;

        const pressureAlt = this.getPressureAltitude(altimeter, altitude);
        
        // Grids: Weight, Temp, PressureAlt
        const grids = [Tables.weight_index, Tables.temperature_index, Tables.pressure_altitude_index];
        const point = [weight, temperature, pressureAlt];
        
        let groundRoll = interpn3D(grids, Tables.sfto_ground_roll, point);
        let dist50ft = interpn3D(grids, Tables.sfto_dist_50_feet, point);
        
        const windMod = this.getWindRunwayModifier(runwayHeading, windSpeed, windDirection);
        const grassMod = this.getGrassModifier(isGrass);
        
        groundRoll *= windMod * grassMod;
        dist50ft *= windMod * grassMod;
        
        // Speeds
        // lift_off_index is mapped to weight_index
        const liftOffSpeed = interpn1D(Tables.weight_index, Tables.lift_off_index, weight);
        const speed50ft = interpn1D(Tables.weight_index, Tables.speed_at_50_feet_index, weight);
        
        return {
            groundRoll: Math.round(groundRoll),
            dist50ft: Math.round(dist50ft),
            liftOffSpeed: Math.round(liftOffSpeed),
            speed50ft: Math.round(speed50ft),
            pressureAlt: Math.round(pressureAlt)
        };
    },
    
    calculateCruise: function(params) {
        const { altitude, temperature, rpm, altimeter } = params;
        const pressureAlt = this.getPressureAltitude(altimeter, altitude);
        
        // Grids: Alt, Temp, RPM
        const grids = [Tables.cruise_pressure_altitudes, Tables.cruise_temperatures, Tables.cruise_rpms];
        const point = [pressureAlt, temperature, rpm];
        
        const tas = interpn3D_Cruise(grids, Tables.cruise_true_airspeed_no_mp, point);
        const fuelFlow = interpn3D_Cruise(grids, Tables.cruise_fuel_flow_no_mp, point);
        
        return {
            trueAirspeed: Math.round(tas * 10) / 10,
            fuelFlow: Math.round(fuelFlow * 10) / 10,
            pressureAlt: Math.round(pressureAlt)
        };
    }
};

// Export for usage
window.Calculator = Calculator;

// ==========================================
// CLIMB CALCULATOR LOGIC
// ==========================================

// Add to Calculator object
Calculator.calculateClimbGradient = function(params) {
    const {
        startAlt, endAlt, startClimbRate, endClimbRate,
        indicatedAirspeed, startTemp, endTemp,
        startWindDir, startWindSpeed, endWindDir, endWindSpeed,
        startHeading, endHeading, altimeter
    } = params;

    const altitudeChange = endAlt - startAlt;
    if (altitudeChange <= 0) return { maxTas: 0, maxGs: 0, minGradient: 0 };

    const sampleInterval = 500;
    let currentAlt = startAlt;
    const sampleAltitudes = [];
    while (currentAlt <= endAlt) {
        sampleAltitudes.push(currentAlt);
        currentAlt += sampleInterval;
    }
    if (sampleAltitudes[sampleAltitudes.length - 1] !== endAlt) {
        sampleAltitudes.push(endAlt);
    }

    let maxTas = 0;
    let maxGs = 0;
    let totalTime = 0;
    let totalDistance = 0;

    for (let i = 0; i < sampleAltitudes.length - 1; i++) {
        const alt = sampleAltitudes[i];
        const nextAlt = sampleAltitudes[i + 1];
        const segmentAltChange = nextAlt - alt;
        const avgAlt = (alt + nextAlt) / 2;

        // Interpolate parameters
        const climbRate = this.interpolateParameter(startAlt, endAlt, avgAlt, startClimbRate, endClimbRate);
        const temp = this.interpolateParameter(startAlt, endAlt, avgAlt, startTemp, endTemp);
        const windDir = this.interpolateParameter(startAlt, endAlt, avgAlt, startWindDir, endWindDir);
        const windSpeed = this.interpolateParameter(startAlt, endAlt, avgAlt, startWindSpeed, endWindSpeed);
        
        // Heading interpolation (circular)
        let headingDiff = (endHeading - startHeading) % 360;
        if (headingDiff > 180) headingDiff -= 360;
        else if (headingDiff < -180) headingDiff += 360;
        
        const heading = (startHeading + this.interpolateParameter(startAlt, endAlt, avgAlt, 0, headingDiff) + 360) % 360;

        const pressureAlt = this.getPressureAltitude(altimeter, avgAlt);
        const tas = this.getTrueAirspeed(indicatedAirspeed, pressureAlt, temp);
        maxTas = Math.max(maxTas, tas);

        const gs = this.getGroundSpeed(tas, heading, windDir, windSpeed);
        maxGs = Math.max(maxGs, gs);

        if (climbRate > 0) {
            const segmentTime = segmentAltChange / climbRate; // minutes
            const segmentDistance = (gs / 60) * segmentTime; // nm
            totalTime += segmentTime;
            totalDistance += segmentDistance;
        }
    }

    const minGradient = totalDistance > 0 ? altitudeChange / totalDistance : 0;

    return {
        maxTas: Math.round(maxTas * 10) / 10,
        maxGs: Math.round(maxGs * 10) / 10,
        minGradient: Math.round(minGradient)
    };
};

Calculator.interpolateParameter = function(startAlt, endAlt, currentAlt, startVal, endVal) {
    if (startAlt === endAlt) return startVal;
    const ratio = (currentAlt - startAlt) / (endAlt - startAlt);
    return startVal + ratio * (endVal - startVal);
};

Calculator.getTrueAirspeed = function(ias, pressureAlt, tempC) {
    const stdTempK = 288.15;
    const tempK = tempC + 273.15;
    const tempRatio = tempK / stdTempK;
    const pressureRatio = Math.pow(1 - (pressureAlt * 6.5e-6), 5.2561);
    const densityRatio = pressureRatio / tempRatio;
    return ias / Math.sqrt(densityRatio);
};

Calculator.getGroundSpeed = function(tas, heading, windDir, windSpeed) {
    const rad = Math.PI / 180;
    const relativeWindAngle = (windDir - heading) % 360;
    const headwindComponent = windSpeed * Math.cos(rad * relativeWindAngle);
    return Math.max(0, tas - headwindComponent);
};
