let kills = 0;
let level = 1;
let obstacles = [];
const levelKills = 10;

// 1. Create a highly subdivided plane grid mesh
const floorGeo = new THREE.PlaneGeometry(WORLD_WIDTH, WORLD_DEPTH, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);

// 2. Access the position attribute array
const posAttr = floorGeo.attributes.position;

for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);

    // PlaneGeometry uses local (X, Y). When rotated -90deg on X, 
    // local Y maps to world -Z. We pass -vy to match world Z space perfectly.
    const zHeight = getTerrainHeight(vx, -vy);
    
    posAttr.setZ(i, zHeight);
}

// Recalculate lightning vectors so shadows shade realistically over hill curves
floorGeo.computeVertexNormals();

const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x2e5a2e, 
    roughness: 0.9,
    wireframe: false 
});

const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2; // Flip flat on ground
floor.receiveShadow = true;
scene.add(floor);

// 3. Centralized Ground-Truth Height Function
function getTerrainHeight(x, z) {
    // Uses the math engine's perlin2D function to calculate real height.
    // If you prefer to stick to sine waves, replace the logic below with:
    // return Math.sin(x / 25) * Math.cos(z / 40) * MAX_HILL_HEIGHT + 0.5;
    
    let height = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < 4; i++) {
        height += perlin2D(x * frequency, z * frequency, 50) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    height /= maxValue;
    return height * MAX_HILL_HEIGHT + 0.5;
}