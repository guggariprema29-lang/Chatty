import dns from 'node:dns/promises';
(async () => {
  try {
    const records = await dns.resolveSrv('_mongodb._tcp.cluster0.oyp4k6d.mongodb.net');
    console.log('SRV records:', records);
  } catch (err) {
    console.error('SRV lookup error:', err);
  }
})();