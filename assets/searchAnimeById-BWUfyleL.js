import{a as e}from"./index-5GYE3_r7.js";var t=`
  query ($ids: String!) {
    animes(ids: $ids) {
      id
      name
      russian
      description
      descriptionHtml
      score
      kind
      rating
      status
      duration
      episodes
      episodesAired
      airedOn { year month day date }
      releasedOn { year month day date }
      poster { originalUrl }
      videos {
        id
        name
        url
        kind
        imageUrl
        playerUrl
      }
      genres { id name russian }
      studios { id name }
    }
  }
`;async function n(n){let r=(await e(t,{ids:String(n)}))?.animes?.[0];if(!r)throw Error(`Тайтл не найден по переданному id`);return r}async function r(n){if(!Array.isArray(n)||n.length===0)return[];let r=[];for(let i=0;i<n.length;i+=10){let a=n.slice(i,i+10).join(`,`);try{let n=await e(t,{ids:a});n?.animes&&r.push(...n.animes)}catch(e){console.warn(`Ошибка загрузки батча аниме ${a}:`,e)}}return r}export{r as n,n as t};