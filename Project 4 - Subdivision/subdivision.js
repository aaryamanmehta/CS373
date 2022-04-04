/* CMPSCI 373 Homework 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;
const aspect = 1;
let scene, renderer, camera, material, orbit, light, surface=null;
let nsubdiv = 0;

let coarseMesh = null;	// the original input triangle mesh
let currMesh = null;		// current triangle mesh

let flatShading = true;
let wireFrame = false;

let objStrings = [
	box_obj,
	ico_obj,
	torus_obj,
	twist_obj,
	combo_obj,
	pawn_obj,
	bunny_obj,
	head_obj,
	hand_obj,
	klein_obj
];

let objNames = [
	'box',
	'ico',
	'torus',
	'twist',
	'combo',
	'pawn',
	'bunny',
	'head',
	'hand',
	'klein'
];

function id(s) {return document.getElementById(s);}
function message(s) {id('msg').innerHTML=s;}

function subdivide() {
	let currVerts = currMesh.vertices;
	let currFaces = currMesh.faces;
	let newVerts = [];
	let newFaces = [];
	/* You can access the current mesh data through
	 * currVerts and currFaces arrays.
	 * Compute one round of Loop's subdivision and
	 * output to newVerts and newFaces arrays.
	 */
// ===YOUR CODE STARTS HERE===
	let VertexAdjacency = [];
	let EdgeHashMap = new Map();
	for(let i = 0; i < currVerts.length; i++) {
		newVerts.push(currVerts[i].clone());
		VertexAdjacency.push([]);
	}
	for (let i = 0; i < currFaces.length; i++) {
		finalComputation(currFaces[i]);
	}
	function computeNewVerticeHelper(a, b, c, d) {
		return (3 * (a + b) + c + d)/8;
	}
	EdgeHashMap.forEach(x => newVerts[x.index] = new THREE.Vector3(computeNewVerticeHelper(currVerts[x.v0].x, currVerts[x.v1].x, currVerts[x.n0].x, currVerts[x.n1].x),
																   computeNewVerticeHelper(currVerts[x.v0].y, currVerts[x.v1].y, currVerts[x.n0].y, currVerts[x.n1].y),
																   computeNewVerticeHelper(currVerts[x.v0].z, currVerts[x.v1].z, currVerts[x.n0].z, currVerts[x.n1].z)));
	for (let i = 0; i < VertexAdjacency.length; i++) {
		function VertexAdjacencyHelper(array,point) {
			return array.reduce((acc,e) => acc+e, 0 ) * (5/8 - ((3/8 + Math.cos(2*Math.PI/VertexAdjacency[i].length)/4) * (3/8 + Math.cos(2*Math.PI/VertexAdjacency[i].length)/4)))/VertexAdjacency[i].length + (1-(5/8 - ((3/8 + Math.cos(2*Math.PI/VertexAdjacency[i].length)/4) * (3/8 + Math.cos(2*Math.PI/VertexAdjacency[i].length)/4))))*point;
		}
		let [a,b,c] = [[],[],[]];
		for (let j = 0; j < VertexAdjacency[i].length; j++) {
			a.push(currVerts[VertexAdjacency[i][j]].x);
			b.push(currVerts[VertexAdjacency[i][j]].y);
			c.push(currVerts[VertexAdjacency[i][j]].z);
		}
		newVerts[i] = new THREE.Vector3(VertexAdjacencyHelper(a, currVerts[i].x), VertexAdjacencyHelper(b, currVerts[i].y), VertexAdjacencyHelper(c, currVerts[i].z));
	}
	for (let i = 0; i < currFaces.length; i++) {
		newFaces.push(new THREE.Face3(EdgeHashMap.get(key(currFaces[i].a, currFaces[i].b)).index, EdgeHashMap.get(key(currFaces[i].b, currFaces[i].c)).index, EdgeHashMap.get(key(currFaces[i].c, currFaces[i].a)).index));
		newFaces.push(new THREE.Face3(EdgeHashMap.get(key(currFaces[i].a, currFaces[i].b)).index, EdgeHashMap.get(key(currFaces[i].b, currFaces[i].c)).v0, EdgeHashMap.get(key(currFaces[i].b, currFaces[i].c)).index));
		newFaces.push(new THREE.Face3(EdgeHashMap.get(key(currFaces[i].c, currFaces[i].a)).index, EdgeHashMap.get(key(currFaces[i].b, currFaces[i].c)).index, EdgeHashMap.get(key(currFaces[i].c, currFaces[i].a)).v0));
		newFaces.push(new THREE.Face3(EdgeHashMap.get(key(currFaces[i].a, currFaces[i].b)).v0, EdgeHashMap.get(key(currFaces[i].a, currFaces[i].b)).index, EdgeHashMap.get(key(currFaces[i].c, currFaces[i].a)).index));
	}
	function computeVertexAdjacency(x) {
		function foo(x1, x2) {
			if (VertexAdjacency[x1].every(x => x != x2)) {
				VertexAdjacency[x1].push(x2);
			}
		}
		foo(x.a, x.b);
		foo(x.a, x.c);
		foo(x.b, x.a);
		foo(x.b, x.c);
		foo(x.c, x.a);
		foo(x.c, x.b);
	}
	function computeEdgeHashMap(x) {
		function foo(a,b,c) {
			let k = key(a,b);
			if (EdgeHashMap.has(k)){
				EdgeHashMap.get(k).n1 = c;
				EdgeHashMap.set(k,EdgeHashMap.get(k));
			}
			else {
				EdgeHashMap.set(k, { v0: a < b ? a : b, v1 : a < b ? b : a, n0 : a, n1 : b, index : currVerts.length });
				currVerts.length++;
			}
		}
		foo(x.a, x.b, x.c);
		foo(x.b, x.c, x.a);
		foo(x.c, x.a, x.b);
	}
	function key(i1,i2) {
		aStr = i1.toString();
		bStr = i2.toString();
		return i1 < i2 ? aStr + "," + bStr: bStr + "," + aStr;
	}
	function finalComputation(x) {
		computeVertexAdjacency(x);
		computeEdgeHashMap(x);
	}
// ---YOUR CODE ENDS HERE---
	/* Overwrite current mesh with newVerts and newFaces */
	currMesh.vertices = newVerts;
	currMesh.faces = newFaces;
	/* Update mesh drawing */
	updateSurfaces();
}

window.onload = function(e) {
	// create scene, camera, renderer and orbit controls
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100 );
	camera.position.set(-1, 1, 3);
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(panelSize, panelSize);
	renderer.setClearColor(0x202020);
	id('surface').appendChild(renderer.domElement);	// bind renderer to HTML div element
	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);	// right light
	scene.add(light);

	let amblight = new THREE.AmbientLight(0x202020);	// ambient light
	scene.add(amblight);
	
	// create materials
	material = new THREE.MeshPhongMaterial({color:0xCC8033, specular:0x101010, shininess: 50});
	
	// create current mesh object
	currMesh = new THREE.Geometry();
	
	// load first object
	loadOBJ(objStrings[0]);
}

function updateSurfaces() {
	currMesh.verticesNeedUpdate = true;
	currMesh.elementsNeedUpdate = true;
	currMesh.computeFaceNormals(); // compute face normals
	if(!flatShading) currMesh.computeVertexNormals(); // if smooth shading
	else currMesh.computeFlatVertexNormals(); // if flat shading
	
	if (surface!=null) {
		scene.remove(surface);	// remove old surface from scene
		surface.geometry.dispose();
		surface = null;
	}
	material.wireframe = wireFrame;
	surface = new THREE.Mesh(currMesh, material); // attach material to mesh
	scene.add(surface);
}

function loadOBJ(objstring) {
	loadOBJFromString(objstring, function(mesh) {
		coarseMesh = mesh;
		currMesh.vertices = mesh.vertices;
		currMesh.faces = mesh.faces;
		updateSurfaces();
		nsubdiv = 0;
	},
	function() {},
	function() {});
}

function onKeyDown(event) { // Key Press callback function
	switch(event.key) {
		case 'w':
		case 'W':
			wireFrame = !wireFrame;
			message(wireFrame ? 'wireframe rendering' : 'solid rendering');
			updateSurfaces();
			break;
		case 'f':
		case 'F':
			flatShading = !flatShading;
			message(flatShading ? 'flat shading' : 'smooth shading');
			updateSurfaces();
			break;
		case 's':
		case 'S':
		case ' ':
			if(nsubdiv>=5) {
				message('# subdivisions at maximum');
				break;
			}
			subdivide();
			nsubdiv++;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'e':
		case 'E':
			currMesh.vertices = coarseMesh.vertices;
			currMesh.faces = coarseMesh.faces;
			nsubdiv = 0;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
			
	}
	if(event.key>='0' && event.key<='9') {
		let index = 9;
		if(event.key>'0')	index = event.key-'1';
		if(index<objStrings.length) {
			loadOBJ(objStrings[index]);
			message('loaded mesh '+objNames[index]);
		}
	}
}

window.addEventListener('keydown',  onKeyDown,  false);

function animate() {
	requestAnimationFrame( animate );
	//if(orbit) orbit.update();
	if(scene && camera)	{
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		renderer.render(scene, camera);
	}
}

animate();
