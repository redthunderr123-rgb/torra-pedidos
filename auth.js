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
  '.lg-box img{height:48px;width:auto;margin:0 auto 8px}.lg-box h1{margin:0 0 6px;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#6b1d1d}'+
  '.lg-box input{height:54px;border:1.5px solid #ddd4cc;border-radius:999px;padding:0 20px;font:500 17px Inter,system-ui,sans-serif;color:#2b2523;background:#fbf8f6}'+
  '.lg-box button{height:54px;border:0;border-radius:999px;background:#6b1d1d;color:#fff;font:700 14px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}'+
  '.lg-box button:disabled{opacity:.5}.lg-err{color:#6b1d1d;font-size:13px;font-weight:600;min-height:16px}';
  document.head.appendChild(css);
  var ov=null;
  function mostrar(){
    if(ov)return;
    var logo=document.querySelector("img.logo");
    ov=document.createElement("div");ov.className="lg-ov";
    ov.innerHTML='<form class="lg-box" id="lg-form" autocomplete="on">'+(logo?'<img alt="Torra" src="'+logo.src+'">':'')+
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
  firebase.auth().onAuthStateChanged(function(u){
    if(u){if(ov){ov.remove();ov=null;}resolver();}
    else mostrar();
  });
  /* Confere usuário e senha de novo, para ações sensíveis */
  window.torraConfirmarLogin=function(usuario,senha){
    var u=firebase.auth().currentUser;
    if(!u)return Promise.reject(new Error("sem-login"));
    if(torraEmail(usuario)!==String(u.email||"").toLowerCase())return Promise.reject(new Error("usuario"));
    return u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,senha));
  };
})();
