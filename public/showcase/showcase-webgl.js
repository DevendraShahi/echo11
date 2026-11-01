import * as THREE from './vendor/three.module.js';
export async function mountGallery({gallery,projects,reduced,getMode}) {
  if(reduced.matches)return undefined;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return undefined;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<701?1.25:1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x000000,0);
  renderer.domElement.className='gallery-canvas';renderer.domElement.setAttribute('aria-hidden','true');document.body.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,1,1000);camera.position.z=100;
  const geometry=new THREE.PlaneGeometry(1,1,24,24),planes=[];
  const vertex=`varying vec2 vUv; uniform float uVelocity; void main(){vUv=uv; vec3 p=position; p.x += sin(uv.y*3.14159265)*uVelocity*.0007; p.y += sin(uv.x*3.14159265)*uVelocity*.0003; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const fragment=`varying vec2 vUv; uniform sampler2D uTexture; uniform float uVelocity; uniform float uImageAspect; uniform float uPlaneAspect; void main(){vec2 uv=(vUv-.5)*vec2(max(uPlaneAspect/uImageAspect,1.),max(uImageAspect/uPlaneAspect,1.))+.5; if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)discard; float shift=uVelocity*.000055; vec4 c=texture2D(uTexture,uv); c.r=texture2D(uTexture,uv+vec2(shift,0.)).r;c.b=texture2D(uTexture,uv-vec2(shift,0.)).b; gl_FragColor=c;
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
  const loader=new THREE.TextureLoader();
  let raf,velocity=0,previous=gallery.scrollTop,lastMotion=performance.now(),lost=false;
  function draw(){
    raf=undefined;if(lost||document.hidden||reduced.matches)return;
    const horizontal=getMode()==='horizontal';
    const position=horizontal?gallery.scrollLeft:gallery.scrollTop;
    const delta=position-previous;previous=position;
    velocity+=(Math.max(-35,Math.min(35,delta))-velocity)*.18;
    if(Math.abs(delta)>.1)lastMotion=performance.now();
    const grid=getMode()==='grid';renderer.domElement.style.visibility=grid?'hidden':'visible';
    planes.forEach(({mesh,element})=>{
      const r=element.getBoundingClientRect();mesh.visible=!grid&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
      element.classList.toggle('gl-ready',!grid&&!reduced.matches);
      if(mesh.visible){mesh.position.set(r.left+r.width/2-innerWidth/2,innerHeight/2-r.top-r.height/2,0);mesh.scale.set(r.width,r.height,1);mesh.material.uniforms.uVelocity.value=velocity;mesh.material.uniforms.uPlaneAspect.value=r.width/r.height;}
    });
    renderer.render(scene,camera);
    if(Math.abs(velocity)>.05||performance.now()-lastMotion<150)raf=requestAnimationFrame(draw);
  }
  function wake(){if(!raf&&!lost&&!document.hidden&&!reduced.matches){lastMotion=performance.now();raf=requestAnimationFrame(draw);}}
  projects.forEach(project=>{
    const element=project.querySelector('.project-image'),image=element.querySelector('img');
    loader.load(image.currentSrc||image.src,texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      const material=new THREE.ShaderMaterial({uniforms:{uTexture:{value:texture},uVelocity:{value:0},uImageAspect:{value:texture.image.width/texture.image.height},uPlaneAspect:{value:1}},vertexShader:vertex,fragmentShader:fragment,transparent:true});
      const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);planes.push({mesh,element});wake();
    },undefined,()=>{});
  });
  const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.left=-innerWidth/2;camera.right=innerWidth/2;camera.top=innerHeight/2;camera.bottom=-innerHeight/2;camera.updateProjectionMatrix();wake();};
  window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=undefined;}else wake();});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=undefined;renderer.domElement.style.visibility='hidden';planes.forEach(p=>p.element.classList.remove('gl-ready'));}else wake();});
  renderer.domElement.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(raf);renderer.domElement.remove();planes.forEach(p=>p.element.classList.remove('gl-ready'));});
  return wake;
}
