import PeerNet from './peer';
const rawJson = localStorage.getItem('peer-net/data')||'{}'
const data = JSON.parse(rawJson);
const PEERNET = new PeerNet(data.__PEER_ID);
export default PEERNET
