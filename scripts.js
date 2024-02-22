var fecha;
var dia;
let dayTag = document.getElementById('porciento');
var dateTag = document.getElementById('fecha');
var clutch ='undef';
// Para modelo
let contenedor;
let camara;
let renderer;
let escena;
let sol;
let luna;
let ancho;
let alto;
let puerto;
var angulo=0;
var angBuffer=0;
var luminous = 0;
// Pare controlar la rotación
var moonSpinig = false;
var animacion;

function init(){
    contenedor = document.querySelector('.lienzo');
    contador = document.getElementById('counter');
    //Crear escena
    ancho = contenedor.clientWidth >= contenedor.clientHeight? contenedor.clientHeight:contenedor.clientWidth
    alto = ancho;
    escena = new THREE.Scene();
    const fov=35;
    const aspect = ancho/alto;
    const near = 0.1;
    const far = 500;
    // CAMARA
    camara = new THREE.PerspectiveCamera(fov,aspect,near,far);
    camara.position.set(0,0,3.5);
    // LUZ
    sol = new THREE.DirectionalLight(0xDDE0E0, 1.0);
    //sol = new THREE.DirectionalLight(0x991111, 1.0); // Luna roja
    //sol = new THREE.DirectionalLight(0x8888FF, 1.0); // Luna azul


    // textura = new THREE.MeshPhongMaterial();
    // textura.map = new THREE.TextureLoader().load("3D/modelo/lroc_color_poles_2k.png");
    // textura.bumpMap = new THREE.TextureLoader().load("3D/modelo/displacemap.png");
    // textura.bumScale = 0.05

    sol.castShadow = true;
    sol.position.set(0,0,6.0);         // Luna Llena
    sol.target.position.set(0,0,0);
    escena.add(sol);
    // Renderizador
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(ancho,alto);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Para que se vea chidoliro  **always use sRGB colorspace in glTF** https://threejs.org/docs/#examples/en/loaders/GLTFLoader
    renderer.outputEncoding = THREE.sRGBEncoding;
    contenedor.appendChild(renderer.domElement);
    //Cargar modelo
    let loader = new THREE.GLTFLoader();
    loader.load("3D/modelo/luna3d.gltf", (gltf) => {
    const root = gltf.scene;
    escena.add(root);
    // Se coloca el índice del arreglo que compone la escena, mira el archivo luna3d.gltf Light[0], Camera[1], Luna[2]
    modeloLuna = gltf.scene.children[2];
    modeloLuna.rotation.y += 4.9;
    renderer.render(escena, camara);
    });
    }

function setDay(stringFecha){
    if (!fecha) {
        stringFecha? fecha = new Date(stringFecha) : fecha = new Date();
    }
    const fullmoon = new Date("2018", "0", "1", "20", "24");
    const cicloLunar = 2551442900;
    const msADias = 86400000;
    var gapp = (fecha - fullmoon) % cicloLunar;
    angulo = 2.0*Math.PI * (gapp / cicloLunar);
    dia = gapp /msADias;
    luminous = Math.abs( Math.cos( Math.PI * (gapp / cicloLunar))); // 22Feb2024 :3
    //console.log("Luminous = " + gapp + " / " + cicloLunar + " = " + gapp/cicloLunar  );
    //dayTag.innerText = Math.trunc(Math.floor(dia)/29.5*10000)/100;
    dayTag.innerHTML = Math.round(luminous * 10000) / 100;
    dateTag.innerText= fecha.toLocaleString('es-MX',{weekday: 'long',day: 'numeric',month: 'long',year: 'numeric',hour: '2-digit',minute: '2-digit',second: '2-digit'});
    //console.log("Día: ",dia);
    dibujar();
}

function modDay(operador){
    funciones={
        add: () => {
            fecha.setDate(fecha.getDate()+1);
            //console.log(fecha);
            clutch = operador
            setDay();
            },
        subs: () => {
            fecha.setDate(fecha.getDate()-1);
            //console.log(fecha);
            clutch = operador
            setDay();
            },
        reset:()=>{
            fecha = '';
            clutch = 'undef';
            setDay();
        }
    }
    funciones[operador]();
}


function dibujar(){

    angBuffer > (Math.PI*2)? angBuffer=0 : angBuffer;
    (angBuffer < 0) ? angBuffer = Math.PI*2 : angBuffer;
    contador.innerHTML = Math.round(angulo * 100 ) / 100;
    const distanciaSolLuna = 6;
    let posX = distanciaSolLuna * Math.sin((angBuffer*-1.0));
    let posY = 0;
    let posZ = distanciaSolLuna * Math.cos((angBuffer*-1.0));
    let hipotenusa = Math.sqrt(Math.pow(posX,2)+Math.pow(posZ,2));
    let angDiff = Math.abs(angulo - angBuffer);
    let step = 0.06 * angDiff;

    //console.log("angDiff: ",angDiff);
    //console.log("angBuffer",angBuffer);
    //console.log("angulo",angulo);
     movement={
         add:() => {
             angBuffer += step;
         },
         subs:() => {
             angBuffer -= step;
         },
         undef:() =>{
            angulo > angBuffer ? angBuffer += step: angBuffer -= step;
         }
     }
    movement[clutch]();



    sol.position.set(posX,posY,posZ);
    sol.target.position.set(0,0,0);
    renderer.render(escena, camara);
    angDiff <= 0.001? cancelAnimationFrame(requestAnimationFrame(dibujar)) : requestAnimationFrame(dibujar);
}

function controlRotation(){
    let rotButton = document.getElementById('ctrlBtton');

if(!moonSpinig){

    rotButton.innerText = 'Detener';
    moonSpinig = true;
    rotate();

}else{
    cancelAnimationFrame(animacion);
    console.log('Stoping rotation....');
    rotButton.innerText = 'Rotar';
    moonSpinig = false;
    }
}

function rotate(){
        // rotButton.addEventListener('click', );
            modeloLuna.rotation.y += 0.0021298;
            renderer.render(escena, camara);
            animacion = requestAnimationFrame(rotate);
            console.log('Rotating ...');
}

// Resposive
function onResize(){
    let ajusteAncho = contenedor.clientWidth >= contenedor.clientHeight? contenedor.clientHeight:contenedor.clientWidth;
    let ajusteAlto  = ajusteAncho;
    camara.aspect = ajusteAncho / ajusteAlto
     camara.updateProjectionMatrix();
     renderer.setSize(ajusteAncho,ajusteAlto);
}



//el constructor de fecha por string es MM DD YYYY hh:mm:ss
// setDay("03 05 2022 18:30:05");

init();
setDay();
window.addEventListener('resize',onResize);
