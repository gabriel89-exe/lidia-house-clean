const https = require('https');

const cameras = [51, 52, 48, 27, 77, 74, 88, 115];

cameras.forEach(id => {
    https.get(`https://www.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx?camera=${id}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const hlsMatch = data.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/i);
            if (hlsMatch) {
               console.log(`Camera ${id}:`, hlsMatch[1]);
            } else {
               // maybe it's an iframe? 
               const iframeMatch = data.match(/<iframe[^>]+src=["']([^"']+)["']/i);
               console.log(`Camera ${id}: No m3u8 found. iframe src =`, iframeMatch ? iframeMatch[1] : 'none');
            }
            
            const titleMatch = data.match(/<span id="[^"]*lblRodovia"[^>]*>(.*?)<\/span>/i);
            const kmMatch = data.match(/<span id="[^"]*lblKMs"[^>]*>(.*?)<\/span>/i);
            console.log(`Camera ${id} Info:`, titleMatch ? titleMatch[1] : '', kmMatch ? kmMatch[1] : '');
        });
    });
});
