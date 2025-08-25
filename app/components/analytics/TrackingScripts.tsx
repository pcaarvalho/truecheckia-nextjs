'use client'

/**
 * Tracking Scripts Component
 * Loads all third-party tracking scripts with proper consent management
 */

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { 
  CLARITY_PROJECT_ID, 
  initClarity, 
  startClarityWithConsent 
} from '@/app/lib/analytics/clarity'
import { 
  FB_PIXEL_ID, 
  initFacebookPixel, 
  grantFacebookConsent 
} from '@/app/lib/analytics/facebook-pixel'
import { 
  LINKEDIN_PARTNER_ID, 
  initLinkedInInsight, 
  grantLinkedInConsent 
} from '@/app/lib/analytics/linkedin-insight'
import { 
  MIXPANEL_TOKEN, 
  initMixpanel, 
  optInMixpanelTracking 
} from '@/app/lib/analytics/mixpanel'

interface TrackingScriptsProps {
  consent?: boolean
  enableClarity?: boolean
  enableFacebook?: boolean
  enableLinkedIn?: boolean
  enableMixpanel?: boolean
}

export function TrackingScripts({ 
  consent = false,
  enableClarity = true,
  enableFacebook = true,
  enableLinkedIn = true,
  enableMixpanel = true,
}: TrackingScriptsProps) {
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  useEffect(() => {
    if (consent && !scriptsLoaded) {
      // Initialize all tracking services when consent is granted
      if (enableClarity && CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'XXXXXXXXXX') {
        startClarityWithConsent()
      }
      
      if (enableFacebook && FB_PIXEL_ID && FB_PIXEL_ID !== 'XXXXXXXXXX') {
        grantFacebookConsent()
      }
      
      if (enableLinkedIn && LINKEDIN_PARTNER_ID && LINKEDIN_PARTNER_ID !== 'XXXXXXXXXX') {
        grantLinkedInConsent()
      }
      
      if (enableMixpanel && MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'XXXXXXXXXX') {
        optInMixpanelTracking()
      }

      setScriptsLoaded(true)
    }
  }, [consent, scriptsLoaded, enableClarity, enableFacebook, enableLinkedIn, enableMixpanel])

  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ANALYTICS_DEBUG) {
    return null
  }

  return (
    <>
      {/* Microsoft Clarity */}
      {enableClarity && CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'XXXXXXXXXX' && (
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `,
          }}
        />
      )}

      {/* Facebook Pixel */}
      {enableFacebook && FB_PIXEL_ID && FB_PIXEL_ID !== 'XXXXXXXXXX' && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                fbq('init', '${FB_PIXEL_ID}');
                ${consent ? "fbq('track', 'PageView');" : ""}
              `,
            }}
          />
          
          {/* Facebook Pixel NoScript */}
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* LinkedIn Insight Tag */}
      {enableLinkedIn && LINKEDIN_PARTNER_ID && LINKEDIN_PARTNER_ID !== 'XXXXXXXXXX' && (
        <>
          <Script
            id="linkedin-insight"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                _linkedin_partner_id = "${LINKEDIN_PARTNER_ID}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                
                (function(l) {
                  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                  window.lintrk.q=[]}
                  var s = document.getElementsByTagName("script")[0];
                  var b = document.createElement("script");
                  b.type = "text/javascript";b.async = true;
                  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                  s.parentNode.insertBefore(b, s);
                })(window.lintrk);
              `,
            }}
          />
          
          {/* LinkedIn NoScript */}
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              alt=""
              src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif`}
            />
          </noscript>
        </>
      )}

      {/* Mixpanel */}
      {enableMixpanel && MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'XXXXXXXXXX' && (
        <Script
          id="mixpanel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
              for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
              
              mixpanel.init('${MIXPANEL_TOKEN}', {
                debug: ${process.env.NODE_ENV === 'development'},
                track_pageview: false,
                persistence: 'localStorage',
                ip: false,
                property_blacklist: ['$current_url', '$initial_referrer', '$referrer'],
                ignore_dnt: false,
                secure_cookie: true,
                cross_subdomain_cookie: false,
                api_host: 'https://api.mixpanel.com'
              });
              
              // Set TrueCheckIA specific super properties
              mixpanel.register({
                'product': 'truecheckia',
                'platform': 'web',
                'environment': '${process.env.NODE_ENV}',
              });
            `,
          }}
        />
      )}

      {/* Hotjar (if enabled) */}
      {process.env.NEXT_PUBLIC_HOTJAR_ID && (
        <Script
          id="hotjar-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}

      {/* Intercom (if enabled) */}
      {process.env.NEXT_PUBLIC_INTERCOM_APP_ID && (
        <Script
          id="intercom-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
              
              window.Intercom('boot', {
                app_id: '${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}',
                name: 'TrueCheckIA User',
                created_at: ${Math.floor(Date.now() / 1000)},
              });
            `,
          }}
        />
      )}

      {/* Crisp Chat (if enabled) */}
      {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID && (
        <Script
          id="crisp-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}";
              (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
            `,
          }}
        />
      )}
    </>
  )
}