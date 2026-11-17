/* Login da equipe Torra (Firebase Authentication). A senha nunca fica no código. */
(function(){
  var DOMINIO="@torracoffee.app";
  window.torraEmail=function(u){u=String(u||"").trim().toLowerCase();return u.indexOf("@")>=0?u:u+DOMINIO;};
  var resolver;window.torraAuthPronto=new Promise(function(r){resolver=r;});
  if(!window.FIREBASE_CONFIG||!window.firebase||!firebase.auth){resolver();return;}
  if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
  var css=document.createElement("style");
  css.textContent='.lg-ov{position:fixed;inset:0;z-index:100;background:#fff;display:flex;align-items:center;justify-content:center;padding:24px}'+
  '.lg-box{width:100%;max-width:380px;display:grid;gap:12px;text-align:center;font-family:Inter,system-ui,sans-serif}'+
  '.lg-logo svg{display:block;width:160px;height:auto;margin:0 auto 10px}.lg-box h1{margin:0 0 6px;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#6b1d1d}'+
  '.lg-box input{height:54px;border:1.5px solid #ddd4cc;border-radius:999px;padding:0 20px;font:500 17px Inter,system-ui,sans-serif;color:#2b2523;background:#fbf8f6}'+
  '.lg-box button{height:54px;border:0;border-radius:999px;background:#6b1d1d;color:#fff;font:700 14px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}'+
  '.lg-box button:disabled{opacity:.5}.lg-err{color:#6b1d1d;font-size:13px;font-weight:600;min-height:16px}';
  document.head.appendChild(css);
  var ov=null;
  function mostrar(){
    if(ov)return;
    ov=document.createElement("div");ov.className="lg-ov";
    ov.innerHTML='<form class="lg-box" id="lg-form" autocomplete="on">'+'<div class="lg-logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 112" role="img" aria-label="Torra"><defs><clipPath id="tc"><ellipse cx="110" cy="58" rx="107" ry="50"/></clipPath></defs><ellipse cx="110" cy="58" rx="107" ry="50" fill="#6b1d1d"/><g clip-path="url(#tc)" fill="none" stroke="#fff" stroke-width="5.5"><path d="M20 24H190V38"/><path d="M42 24V86"/><circle cx="70" cy="68" r="15.5"/><path d="M97 86V53M97 66Q97 52.5 113 52.5"/><path d="M124 86V53M124 66Q124 52.5 140 52.5"/><circle cx="163" cy="68" r="15.5"/><path d="M181.5 52V86"/></g></svg></div>'+
      '<h1>Acesso da equipe</h1><input id="lg-u" name="username" autocomplete="username" placeholder="Usuário" autocapitalize="none" required>'+
      '<input id="lg-p" name="password" type="password" autocomplete="current-password" placeholder="Senha" required>'+
      '<button type="submit" id="lg-b">Entrar</button><div class="lg-err" id="lg-e" role="status"></div></form>';
    document.body.appendChild(ov);
    document.getElementById("lg-form").onsubmit=function(e){
      e.preventDefault();var b=document.getElementById("lg-b"),er=document.getElementById("lg-e");b.disabled=true;er.textContent="";
      firebase.auth().signInWithEmailAndPassword(torraEmail(document.getElementById("lg-u").value),document.getElementById("lg-p").value)
        .catch(function(x){er.textContent=/network/i.test(x&&x.code||"")?"Sem internet. Tente de novo.":"Usuário ou senha incorretos.";b.disabled=false;});
    };
  }
  var VALIDADE=5*24*60*60*1000; /* login vale 5 dias */
  var liberado=false,saiu=false;
  function vencido(u){var t=Date.parse(u&&u.metadata&&u.metadata.lastSignInTime||"");return !isNaN(t)&&Date.now()-t>VALIDADE;}
  firebase.auth().onAuthStateChanged(function(u){
    if(u&&vencido(u)){firebase.auth().signOut();return;}
    if(u){
      if(saiu&&liberado){location.reload();return;} /* religa a fila depois de um novo login */
      if(ov){ov.remove();ov=null;}liberado=true;resolver();
    }else{if(liberado)saiu=true;mostrar();}
  });
  setInterval(function(){var u=firebase.auth().currentUser;if(u&&vencido(u))firebase.auth().signOut();},10*60*1000);
  /* Confere usuário e senha de novo, para ações sensíveis */
  window.torraConfirmarLogin=function(usuario,senha){
    var u=firebase.auth().currentUser;
    if(!u)return Promise.reject(new Error("sem-login"));
    if(torraEmail(usuario)!==String(u.email||"").toLowerCase())return Promise.reject(new Error("usuario"));
    return u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,senha));
  };
})();
