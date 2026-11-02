/* Full site: explicit opt-in. Splash: server-selected regional policy. */
(() => {
 const id='G-EJES69N4D2',key='2d1:analytics-consent';
 const production=['2d1.studio','www.2d1.studio'].includes(location.hostname);
 const t=window.SiteLanguage?.t||(value=>value);
 const policy=document.documentElement?.dataset.analyticsPolicy || 'consent';
 const permitted=policy==='auto'||policy==='consent';
 const panel=document.querySelector?.('#analytics-settings');
 const toggle=document.querySelector?.('[data-analytics-settings]');
 let loaded=false,memory=null;
 const browserOptOut=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1';
 const stored=()=>{if(memory!==null)return memory;try{const value=localStorage.getItem(key);return ['granted','denied'].includes(value)?value:null}catch{return null}};
 const allowed=()=>permitted&&!browserOptOut()&&(stored()==='granted'||policy==='auto'&&stored()===null);
 function clearCookies(){
  for(const cookie of document.cookie.split(';')){
   const name=cookie.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(name))continue;
   for(const domain of ['',location.hostname,'.'+location.hostname,'.2d1.studio'])document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax'+(domain?'; Domain='+domain:'');
  }
 }
 function sync(){
  const enabled=allowed();window['ga-disable-'+id]=!enabled;
  if(!enabled){clearCookies();if(loaded)window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
  if(enabled&&production&&!loaded){
   loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
   window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   let referrer='';try{const ref=new URL(document.referrer);referrer=ref.origin}catch{}
   window.gtag('config',id,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_update:false});
   window.gtag('event','page_view',{page_location:location.origin+location.pathname,page_referrer:referrer,page_title:document.title});
   const script=document.createElement('script');script.async=true;script.dataset.analyticsTag='';script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
  }else if(enabled&&production&&loaded){window.gtag?.('consent','update',{analytics_storage:'granted'});}
  document.querySelectorAll('[data-analytics-choice]').forEach(input=>{input.checked=enabled;input.disabled=!permitted||browserOptOut();});
  document.querySelectorAll('[data-analytics-status]').forEach(status=>status.textContent=t(browserOptOut()?'Analytics is off because of your browser’s privacy settings.':!permitted?'Analytics is off for this visit. No analytics information is sent to Google.':enabled?'Analytics is allowed in this browser. You can turn it off at any time.':'Analytics is off. The website works the same either way.'));
  document.querySelectorAll('[data-analytics-actions]').forEach(actions=>actions.hidden=!permitted||browserOptOut());
 }
 function showPanel(open){if(!panel||!toggle)return;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close':'Privacy';}
 function setAllowed(value){memory=value?'granted':'denied';try{localStorage.setItem(key,memory);memory=null}catch{}sync();}
 window.SiteAnalytics=Object.freeze({isAllowed:allowed,setAllowed});
 document.querySelectorAll('[data-analytics-choice]').forEach(input=>input.addEventListener('change',()=>setAllowed(input.checked)));
 document.querySelectorAll('[data-analytics-ui]').forEach(ui=>ui.hidden=false);
 toggle?.addEventListener('click',()=>showPanel(panel.hidden));
 for(const [selector,value] of [['[data-analytics-allow]',true],['[data-analytics-decline]',false]]){
  document.querySelectorAll(selector).forEach(button=>button.addEventListener('click',()=>{setAllowed(value);showPanel(false);toggle?.focus();}));
 }
 addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden){showPanel(false);toggle?.focus();}});
 addEventListener('storage',event=>{if(event.key===key||event.key===null){memory=null;sync();if(stored()!==null)showPanel(false);}});
 sync();
 if(policy==='consent'&&stored()===null&&!browserOptOut())showPanel(true);
})();
