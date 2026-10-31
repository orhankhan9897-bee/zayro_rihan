'use strict';
/* ZAYRO CARS v8.0 — smooth, curvy hypercar bodies (lofted meshes) replacing the old cube-built cars.
   Loads after zayro_realism.js. Player, traffic, rivals, police and ghost all use it.
   Cockpit camera keeps the original model because it contains the interior. */
(function(){
const zr=window.zrState||{brake:false,backfire:0};
const sgn=v=>v<0?-1:1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- curve helper: smooth interpolation through knots [[t,v],...] ---------- */
function curve(k,t){
  if(t<=k[0][0])return k[0][1];
  for(let i=0;i<k.length-1;i++){
    if(t<=k[i+1][0]){
      const a=k[i],b=k[i+1],p0=k[Math.max(0,i-1)],p3=k[Math.min(k.length-1,i+2)];
      const u=(t-a[0])/(b[0]-a[0]);
      const m1=(b[1]-p0[1])/(b[0]-p0[0])*(b[0]-a[0]),m2=(p3[1]-a[1])/(p3[0]-a[0])*(b[0]-a[0]);
      const u2=u*u,u3=u2*u;
      return (2*u3-3*u2+1)*a[1]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*b[1]+(u3-u2)*m2;
    }
  }
  return k[k.length-1][1];
}

/* ---------- loft: stations -> smooth mesh ---------- */
function buildLoft(stations,N){
  const P=[];
  for(const s of stations){
    const ring=[];
    for(let j=0;j<N;j++){
      const a=j/N*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),e=s.e;
      const x=s.hw*sgn(c)*Math.pow(Math.abs(c),e)*(sn<0?s.low:1);
      const y=s.cy+s.hh*sgn(sn)*Math.pow(Math.abs(sn),e);
      ring.push([x+(s.dx||0),y,s.z]);
    }
    P.push(ring);
  }
  const R=P.length,pos=[],nor=[];
  const normal=(i,j)=>{
    const i0=Math.max(0,i-1),i1=Math.min(R-1,i+1),jp=(j+1)%N,jm=(j+N-1)%N;
    const du=[P[i1][j][0]-P[i0][j][0],P[i1][j][1]-P[i0][j][1],P[i1][j][2]-P[i0][j][2]];
    const dv=[P[i][jp][0]-P[i][jm][0],P[i][jp][1]-P[i][jm][1],P[i][jp][2]-P[i][jm][2]];
    let n=[dv[1]*du[2]-dv[2]*du[1],dv[2]*du[0]-dv[0]*du[2],dv[0]*du[1]-dv[1]*du[0]];
    let l=Math.hypot(n[0],n[1],n[2]);
    const st=stations[i],out=[P[i][j][0]-(st.dx||0),P[i][j][1]-st.cy,0];
    if(l<1e-7){n=[0,0,i<R/2?-1:1];l=1;}
    n=[n[0]/l,n[1]/l,n[2]/l];
    if(n[0]*out[0]+n[1]*out[1]<0&&Math.abs(n[2])<.999)n=[-n[0],-n[1],-n[2]];
    return n;
  };
  for(let i=0;i<R-1;i++)for(let j=0;j<N;j++){
    const jn=(j+1)%N;
    const q=[[i,j],[i+1,j],[i+1,jn],[i,j],[i+1,jn],[i,jn]];
    for(const [a,b] of q){pos.push(...P[a][b]);nor.push(...normal(a,b));}
  }
  const pb=gl.createBuffer(),nb=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(nor),gl.STATIC_DRAW);
  return {pb,nb,count:pos.length/3};
}

/* ---------- five hypercar designs (one per stage car) ---------- */
const STY=[
 {W:.98,Hl:2.05,roof:1.18,tail:.76,nose:.52,cabS:.27,cabE:.69,wing:2,flare:.96},   // Street Racer: compact sports
 {W:1.06,Hl:2.32,roof:1.22,tail:.80,nose:.66,cabS:.36,cabE:.74,wing:0,flare:1.0},  // Muscle Storm: long hood
 {W:1.00,Hl:2.28,roof:1.06,tail:.72,nose:.44,cabS:.30,cabE:.66,wing:1,flare:1.04}, // Volt Supercar: low wedge
 {W:1.05,Hl:2.30,roof:1.12,tail:.80,nose:.48,cabS:.30,cabE:.70,wing:3,flare:1.06}, // Hyper RS: big wing
 {W:1.08,Hl:2.42,roof:1.08,tail:.82,nose:.42,cabS:.31,cabE:.68,wing:1,flare:1.1}   // Champion X: wide prototype
];
const meshCache=[];
function getMeshes(si){
  if(meshCache[si])return meshCache[si];
  const S=STY[si],K=46,N=34;
  const WK=[[0,.80],[.07,.94],[.2,1.0],[.34,.99],[.5,.90],[.68,.88],[.86,.80],[1,.62]];
  const YT=[[0,S.tail-.12],[.1,S.tail],[.24,S.tail+.07],[.36,S.tail+.01],[.5,.70],[.66,S.nose+.27],[.84,S.nose+.19],[.93,S.nose+.09],[1,S.nose-.08]];
  const ends=t=>{const m=Math.min(t,1-t)/.075;return m>=1?1:Math.sqrt(Math.max(0,1-(1-m)*(1-m)));};
  const body=[];
  for(let k=0;k<=K;k++){
    const t=.5-.5*Math.cos(Math.PI*k/K),f=ends(t);
    let yb=.19;if(t<.07)yb=.31-t/.07*.12;else if(t>.93)yb=.19+(t-.93)/.07*.07;
    const yt=curve(YT,t),hh=Math.max(.0001,(yt-yb)/2*f);
    body.push({z:-S.Hl+2*S.Hl*t,cy:(yt+yb)/2,hh,hw:Math.max(.0001,S.W*curve(WK,t)*f),e:.5,low:.84});
  }
  // glass canopy and body-colour roof panel
  const cab=[],roof=[];
  const base=.64;
  for(let k=0;k<=34;k++){
    const s=.5-.5*Math.cos(Math.PI*k/34),t=S.cabS+(S.cabE-S.cabS)*s,f=Math.sqrt(Math.max(0,1-Math.pow(1-clamp(Math.min(s,1-s)/.1,0,1),2)));
    const prof=Math.pow(Math.sin(Math.PI*Math.pow(s,.86)),.62);
    const top=base+(S.roof-base)*prof;
    const wBody=S.W*curve(WK,t),cw=wBody*(.70-.14*Math.abs(s-.5)*1.6)*f;
    const hh=Math.max(.0001,(top-(base-.07))/2);
    cab.push({z:-S.Hl+2*S.Hl*t,cy:(top+base-.07)/2,hh,hw:Math.max(.0001,cw),e:.62,low:.92});
    const rf=clamp((s-.12)/.2,0,1)*clamp((.9-s)/.25,0,1);
    roof.push({z:-S.Hl+2*S.Hl*t,cy:top-.005,hh:Math.max(.0001,.028*rf),hw:Math.max(.0001,cw*.52*rf),e:.8,low:1});
  }
  return (meshCache[si]={body:buildLoft(body,N),cab:buildLoft(cab,N),roof:buildLoft(roof,18),S});
}

function drawMesh(vp,car,mesh,color,gloss){
  const p=localPoint(car,0,0,0);if(car===player)p[1]+=suspensionBob;
  bind(mesh.pb,mesh.nb);
  gl.uniformMatrix4fv(attr.vp,false,vp);
  gl.uniformMatrix4fv(attr.model,false,modelMatrix(p,[1,1,1],car.yaw,car===player?car.roll*.12+car.pitch:0));
  gl.uniform3fv(attr.color,color);gl.uniform1f(attr.road,0);gl.uniform1f(attr.gloss,gloss);
  gl.drawArrays(gl.TRIANGLES,0,mesh.count);
}
const glowOn=()=>gl.uniform1f(attr.emit,1),glowOff=()=>gl.uniform1f(attr.emit,0);
const dim=(c,k)=>c.map(v=>Math.min(1,v*k));

const _prev=drawCar;
drawCar=function(vp,car,color,style=0,boost=false){
  if(car===player&&typeof cameraMode!=='undefined'&&cameraMode===1)return _prev(vp,car,color,style,boost);
  const si=((style%5)+5)%5,M=getMeshes(si),S=M.S,W=S.W,H=S.Hl;
  const isP=car===player,dark=condition==='night'||condition==='rain'||selectedRoad===4;
  const brk=isP?zr.brake:!!car.braking;
  const carbon=[.045,.05,.055];
  // soft ground shadow
  drawSphere(vp,car,[.06,.02,-.04],[W*.98,.012,H*.96],[.012,.014,.017]);
  drawSphere(vp,car,[.04,.026,-.02],[W*.8,.01,H*.8],[.006,.007,.009]);
  // wheels first so the fenders overlap them naturally
  const wx=W*.78,wz=H*.58;
  for(const side of [-1,1])for(const z of [-wz-.05,wz])drawWheel(vp,car,side*wx,z);
  // main body, glass canopy, roof panel
  drawMesh(vp,car,M.body,color,.9);
  drawMesh(vp,car,M.cab,[.02,.04,.055],.95);
  drawMesh(vp,car,M.roof,dim(color,.96),.9);
  // dark wheel-arch cavities and side skirts
  for(const side of [-1,1]){
    drawPart(vp,car,[side*W*.80,.25,-.05],[.025,.03,H*.26],carbon);
    // door shut line + air intake behind the door
    drawPart(vp,car,[side*W*.92,.62,H*(.03)],[.006,.2,.012],[.01,.01,.012]);
    drawPart(vp,car,[side*W*.9,.60,-H*.30],[.04,.11,.26],[.01,.012,.014]);
    drawPart(vp,car,[side*W*.9,.5,H*.05],[.02,.02,.9],dim(color,.55));
    // mirrors
    drawSphere(vp,car,[side*W*.66,.90,H*.18],[.15,.07,.10],dim(color,.95));
    drawPart(vp,car,[side*W*.64,.84,H*.15],[.03,.05,.03],carbon);
  }
  // ---------- front ----------
  const nz=H-.04;
  drawPart(vp,car,[0,.27,nz-.1],[W*.62,.018,.09],carbon);                       // splitter
  drawPart(vp,car,[0,S.nose-.01,nz],[W*.50,.075,.03],[.012,.014,.016]);           // lower intake
  for(let v=-3;v<=3;v++)drawPart(vp,car,[v*W*.12,S.nose-.01,nz+.005],[.012,.07,.012],[.35,.38,.4]); // mesh slats
  for(const side of [-1,1]){
    drawPart(vp,car,[side*W*.56,S.nose+.05,nz-.16],[.27,.03,.06],[.012,.014,.017]);
    const lamp=dark||isP&&condition!=='clear';
    glowOn();drawPart(vp,car,[side*W*.56,S.nose+.075,nz-.14],[.22,.014,.03],lamp?[1,.97,.82]:[.82,.9,1]);glowOff();
  }
  // ---------- rear ----------
  const rz=-H+.03;
  drawPart(vp,car,[0,.50,rz-.02],[W*.52,.12,.03],[.01,.011,.013]);                 // rear mesh grille panel
  for(let v=-4;v<=4;v++)drawPart(vp,car,[v*W*.11,.5,rz-.045],[.012,.11,.012],[.28,.3,.32]);
  drawPart(vp,car,[0,.285,rz-.04],[W*.72,.045,.14],carbon);                        // diffuser
  for(let v=-2;v<=2;v++)drawPart(vp,car,[v*W*.18,.3,rz-.1],[.01,.05,.08],[.08,.09,.1]);
  const kb=brk?1:(dark?.45:.22);
  glowOn();
  for(const side of [-1,1]){
    drawSphere(vp,car,[side*W*.64,.66,rz+.02],[.2,.1,.05],[kb,.04*kb,.03*kb]);
    drawPart(vp,car,[side*W*.40,.70,rz+.04],[W*.3,.025,.03],[kb,.05*kb,.035*kb]);
  }
  drawPart(vp,car,[0,.745,rz+.02],[W*.28,.02,.03],[kb,.05*kb,.035*kb]);
  glowOff();
  drawPart(vp,car,[0,.40,rz-.06],[.25,.07,.01],[.93,.93,.86]);                      // plate
  // exhausts and flames (blue boost flames like a modern hypercar)
  for(const side of [-1,1]){
    drawPart(vp,car,[side*W*.34,.43,rz-.1],[.08,.08,.08],[.55,.58,.62]);
    drawPart(vp,car,[side*W*.34,.43,rz-.18],[.055,.055,.03],[.01,.01,.012]);
    if(isP&&boost){
      const fl=Math.random();glowOn();
      drawPart(vp,car,[side*W*.34,.43,rz-.3-fl*.22],[.07,.07,.3+fl*.3],[.35,.6,1]);
      drawPart(vp,car,[side*W*.34,.43,rz-.55-fl*.4],[.045,.045,.4+fl*.3],[.55,.8,1]);
      drawPart(vp,car,[side*W*.34,.43,rz-.9-fl*.5],[.025,.025,.35+fl*.2],[.95,.98,1]);
      glowOff();
    }else if(isP&&zr.backfire>0){
      glowOn();drawPart(vp,car,[side*W*.34,.43,rz-.4],[.07,.07,.32],[1,.45,.08]);glowOff();
    }
  }
  // ---------- wings ----------
  const wingBlade=(y,hw,chord,zc)=>{drawPart(vp,car,[0,y,zc],[hw,.028,chord],carbon);drawPart(vp,car,[0,y+.04,zc-chord*.5],[hw,.02,.03],dim(color,.9));for(const s of [-1,1])drawPart(vp,car,[s*hw,y+.04,zc],[.02,.12,chord*1.05],carbon);};
  if(S.wing===1||S.wing===2||S.wing===3){
    const y=S.tail+.28+(S.wing===3?.16:0),hw=W*(S.wing===3?.96:.78),ch=S.wing===3?.26:.17;
    for(const s of [-1,1])drawPart(vp,car,[s*W*.34,S.tail+.1,rz+.5],[.03,(y-S.tail)*.5,.05],carbon);
    wingBlade(y,hw,ch,rz+.45);
  }
  if(S.wing===0){drawPart(vp,car,[0,S.tail+.06,rz+.2],[W*.8,.018,.08],dim(color,.9));}
  // hood vents / centre stripe
  drawPart(vp,car,[0,S.nose+.285,H*.42],[W*.16,.008,H*.2],carbon);
  // side marker and badge-less detailing
  for(const side of [-1,1])drawPart(vp,car,[side*W*.93,.52,H*.52],[.012,.02,.06],[1,.55,.1]);
  // night/rain: dim running lights on traffic
  if(!isP&&dark){glowOn();for(const side of [-1,1])drawSphere(vp,car,[side*W*.56,S.nose+.08,nz-.14],[.14,.03,.03],[.95,.93,.8]);glowOff();}
};
})();
