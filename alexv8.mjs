// ╔══════════════════════════════════════════════╗
// ║         A L E X.  V8                             ║
// ║                                                            ║
// ╚══════════════════════════════════════════════╝

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    delay,
    fetchLatestBaileysVersion,
    Browsers,
    downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom }          from '@hapi/boom';
import pino              from 'pino';
import fs                from 'fs';
import readline          from 'readline';
import { EdgeTTS }       from '@andresaya/edge-tts';
import { spawnSync }     from 'child_process';
import ffmpegPath        from 'ffmpeg-static';
import { createCanvas, loadImage } from 'canvas';
import { parse as twParse }        from 'twemoji-parser';

// ─────────────────────────────────────────────
//  STORAGE PATHS
// ─────────────────────────────────────────────
const PATH_AUTH    = (id) => `./sessions/${id}`;
const PATH_USERS   = './store/users.json';
const PATH_NETWORK = './store/network.json';
const PATH_TIMING  = './store/timing.json';
const PATH_PREFIX  = './store/prefix.json';
const PATH_SAVED   = './store/saved.json';
const PATH_BANNER      = './store/banner.jpg';
const PATH_BANNER_VID  = './store/banner.mp4';
const PATH_BIO         = './store/bio.txt';

// ── AUTO-INSTALL COOKIES ─────────────────────
try {
    fs.mkdirSync('./store', {recursive:true});
    if(!fs.existsSync('./store/cookies.txt')){
        const b64 = "IyBOZXRzY2FwZSBIVFRQIENvb2tpZSBGaWxlCiMgaHR0cHM6Ly9jdXJsLmhheHguc2UvcmZjL2Nvb2tpZV9zcGVjLmh0bWwKIyBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUhIERvIG5vdCBlZGl0LgoKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE3OTE0OTgzNDEJX19TZWN1cmUtQlVDS0VUCUNLSUQKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE3NzU5NDgxNDEJR1BTCTEKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE3OTE0OTkwMjEJVklTSVRPUl9JTkZPMV9MSVZFCXpxUWxlYVZnNlJZCi55b3V0dWJlLmNvbQlUUlVFCS8JVFJVRQkxNzkxNDk5MDIxCVZJU0lUT1JfUFJJVkFDWV9NRVRBREFUQQlDZ0pWVXhJRUdnQWdQZyUzRCUzRAoueW91dHViZS5jb20JVFJVRQkvCVRSVUUJMTgxMDUwNjM0MglfX1NlY3VyZS0zUEFQSVNJRAlSd1J4MVAweFdPaThTS1dJL0FJOHVoZWxDTmpKQl9TTW9ICi55b3V0dWJlLmNvbQlUUlVFCS8JVFJVRQkxODEwNTA2MzQyCV9fU2VjdXJlLTNQU0lECWcuYTAwMDh3aWo2STFBeTFGMThpRWFlejZFUEEyMFlBQmpGenFUaEJfMnA0RGRVYVNrNVBxdFNleEowTFlqU2c0UUV1MVNQd1R3MlFBQ2dZS0FiNFNBUkVTRlFIR1gyTWlNZThZdUpvT28zTnJkX29lNnU3djV4b1ZBVUY4eUtwUG9DMUZSTWNqWlZQR0pWQ0FGbTcxMDA3NgoueW91dHViZS5jb20JVFJVRQkvCVRSVUUJMTgxMDUwNjM0MglMT0dJTl9JTkZPCUFGbW1GMnN3UlFJZ1NQcFphZFFsODIxX3VjM3NqdDhlbUdTVHRTaTZQVjEzanl4QklabjhQNmdDSVFEVTBiZUNEcXV1N1FYWm5nVWtTY215Sm54MFJ5WDdPcW5fckpSU244ZVo4UTpRVVEzTWpObWVDMXJNVUYzTkdjM2RsTlFSbUpXTWxFMVpIQnVSMFJmVDB0aVpuWlpOSG8xTjB0dFRtbFJiV0pYV25CRGFYSjRlalZqUTBkVVpIb3dRbDh5UzA1RFdGcEZRbXBxY0VoRU0xaHhOMHQ0UmxZM1oyRmFiM0o0ZDBSU2JrRmFjazF0UVZSWVpqSnFiRlIzU2tka1lXUXpOQzFvVDNkYU0wWlFZbXc0WDFWRVZIQm9OV1ZHTUdJMVpGRmpVVTFuTmtGSGQxUkZjRmR2WDJOTFl6ZEIKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE4MTA1MDcwMzEJUFJFRglmNj00MDAwMDAwMCZ0ej1VVEMKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTAJWVNDCUotYWlwYUV1VGFjCi55b3V0dWJlLmNvbQlUUlVFCS8JVFJVRQkxODA3NDgzMDI3CV9fU2VjdXJlLTFQU0lEVFMJc2lkdHMtQ2pVQldob3RDZXRLbnB5b3VXNy1xUW0xY25rRVoyZElUdnQyVy1DSWM1MGIycllYSmh3MmNfcnhzU0lWVDQ2S3ZhMlVXQ1U3N1JBQQoueW91dHViZS5jb20JVFJVRQkvCVRSVUUJMTgwNzQ4MzAyNwlfX1NlY3VyZS0zUFNJRFRTCXNpZHRzLUNqVUJXaG90Q2V0S25weW91VzctcVFtMWNua0VaMmRJVHZ0MlctQ0ljNTBiMnJZWEpodzJjX3J4c1NJVlQ0Nkt2YTJVV0NVNzdSQUEKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE3NzU5NDc3MTcJQ09OU0lTVEVOQ1kJQUg1SzlyWnBYcDlOUEVMVjE1WHFzam9haEFQYW1HZGxVYWZSYUNtdXgtNjNzYXc3ZWRmalVJcnRhRURvZ1JUcTRJam5Wbi0ySGpWYl9MbmtNRFJyMElEUC05REZjV0xmRFJibTZfbXZtX3RScFZhYzhBTDZkbU9CeDVCN1p6WDR0TjV4c0hTb2ZQY1N1bUExbjB6TmN3WWcKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE4MDc0ODMxMTgJX19TZWN1cmUtM1BTSURDQwlBS0V5WHpVQlN1UUtZNF9mbzZXcHhNZm9FZXZ4cU01SXp5MzBrNmROYlR6N1BEc0N6ZkJVNjlHZzI3b2ctNWtqbjNza2s4c2EKLnlvdXR1YmUuY29tCVRSVUUJLwlUUlVFCTE3OTE0OTgzNDEJX19TZWN1cmUtUk9MTE9VVF9UT0tFTglDTEhjdC0zRnRicmNRaEN6MWJiVzYtYVRBeGpIa3NmVzYtYVRBdyUzRCUzRAoKd3d3LnBpbnRlcmVzdC5jb20JRkFMU0UJLwlUUlVFCTE4MDc0Nzg0MjAJY3NyZnRva2VuCWRkNWVjNDE2ZWU4ODg0MTI5YjRjMmU0NDlkOTMzNmFlCnd3dy5waW50ZXJlc3QuY29tCUZBTFNFCS8JRkFMU0UJMTc3NjAyODgyMAlfcm91dGluZ19pZAkiYmYwZTMxZGEtZTk2ZC00MzkzLWE3ZjMtNjEyNzAwMzY4OGMwIgoucGludGVyZXN0LmNvbQlUUlVFCS8JVFJVRQkxODA3MDQ2NDc1CV9hdXRoCTEKLnBpbnRlcmVzdC5jb20JVFJVRQkvCVRSVUUJMTgwNzA0NjQ3NQlfcGludGVyZXN0X3Nlc3MJVFdjOVBTWnVSVUZQVld3dldWSjJaMGc1YkdzclVrRlhNWFl6TnpWUVpHcHpVbmsyUVhaMWEwOHpZM1ZOV0ZaT01IQkNSSEZPVW1sVlp6UlJPV1ZCTVhaMWRrVnpNRmx6ZW5wQloxb3pZblp0TjJ4V1FsSlJXV3BLUXl0NGFESjRlR3BaYjJKSlZYWnlNRTlMTWpWS1pteG5jR3RWTm1GVWVtaEVjbGRwUjFZMlduRkNTREp3ZUcxNmNqYzBiSEV3TUVVdk1GSXplVkJGZEdkUlJFdHhRamN3UTBoQ1ZEYzRiamR4TXpGMk1XbEphSE16U25WbE5IZ3ZhSFpDVGpFNFlWcGxZMnRtYkdocGRuaEhXV2xDUm1selVDdExTblkyY1V3eldVVktSMHhEVjJKTlZtTlJiRGs1Tmxnck1qYzVZbUZFTlM5S1pHMXJUM2x1Ym1oMWMydEJNbWw2TVVaVFZIRnBTbU5PTlhodllXUTFjekZJVWpOc2FHOU1hMUpOUTIxTWVEQkNha3hFZEhSbVYyaDFSM2dyTm5wbFZXVkZXV2RRTUhvM01UVldjRmgxVkhsSWIzbHZSV0kzYnpKR1FsZHNTMEpST0Rkck5FaFdRa05tZUhkM1dqQjFWeTh3VFd0dE1UQm1SMHBGZWtKYWJrRk1LemhxTmtocWNXTnRkWEJzV0V4YVkwVjJNMjVpTW5GS1JYVjNURlI1TkVkVGNqUTBVMGRpV0ZsYU4ycGhiVTVUTlZKdGIyY3ZkMlJRYjNNemFrNHhVMVp1VDBKM2EybFpTVEJHT0M5b00yeGlTM2hSYW1sc2RUaFVaalUwVEM4dk5tbEpjRWRWZVVKbVpUVkxha2w2V1VSamNHOTVSMFZ5U1VwaU1IQkNlRTAwUjFkRU1UZHBaRWRSY214SlJrSlplVE5NWjAxWVkxQkZVVWhDT1c5RGMxaHpaRU5LVVhrM1pIWldlVzV3ZUdKQ2FFbDBlalZSZDIwd05IVlpWVkpRU21SdmRrNUthVlZCZVdWeGJsUlJOM0paVmpJeVoycE1Oa3hyY0RSeVkydHRWbVZHV0Vzd1R6WlhNamhaWW5kUFdYbzJaV2hTYmxCbmVqY3hVRzFKWnpkaFpFZDNiamcwYWt4dlF6QmtaRVF6TTJaU1dFNXVaM1pRU2xVM09IZFhkMDAzWmxSV01VSkZRMHA2Y1cxalNIQlJPVmszZUZObGN6aFhaVmhZYVVKQlZXMXFOREJxWkVwNFUwTmhkMWcxVkVKSmJsZFVSVEJrWms0MmQyTjFTSFJVVUVWV1MyaE9iM2hZZUhKS05YUjJjMkpQYnprMVdsY3JiR3htWVU5dE1XSkxVRzlSTDJKa2RIbEJPV0pSWm5KVGRIbFNWRzFJSzNONVdsRmlURE5pTkVsWk4wNUZURmdyWVhKMk1USjZRVFZIWkhaUGNXOXlSbHBFYVc5SVdrdEphamd4VkVaVFUxVmpRalpxVVdGWmVqUXZhbWhEU21wT1VsRlJOaTlVSzNrMlJWaFJhbGd3VVVOUmVFaG9TemhaZFUxTGNFRlhRbGhEUnpaQ1kzcHFNWEU0UXpKVGRVbFJjbTlQU25KU1NYbFJXVmh5ZGsxSE4zRjRaelZXVjJWRWF6VTVRVUpCZVRaQ1NIcExaR1p4VlRoQlRHWjBORmRwYmpOMGIybGhRMFF3TkZWNk5qazFVblZ3WldWMk9YQjBibWg2VWxsWFVFVXhMMVptVVRSd2VYQjRTMlJJZUV4aVdtWXhTM0F4YUZoWWNXUjVaWEJHU1ZGMlVVaG1lU3RHVEU5T1JVTm5kSEZZZDFrMFdXOXdRMXBRYXl0bmNVUm1iWE4wVFVKamRUSTJSbXBsTW5aWk4wdExUa2R1YnpkWFpEaEtlVzlaYUhONEwxTmtjR3RrU2tWa2RIcDJkMXBhVVRsNU1IRXdXRFJOYlhaT09FMXZTV3AxVW01WFFrMTZURkJhV1M5cWFHNVNlV012YWtwME5ucFBkakpOTDJNMlNpOUtTRXA1ZVVWMmRGRTBWME5QZUdwR1RtaExVWGc1YkZWaU55dHpPR0ZyT1RabWRVYzVRM1JuUjB0SllXb3hiVGd2TkVGSWQwTk1Za3RGWVhaQlNFMU1TVFpMZVdwcWNGcGxTR3hwTkhsdVRXOUZhRE16U1hWUmVsVlVhakF4Y1RaNVNuVktNWFl2Tms1VUswUk9TRUpJTTJsVFF6Y3pha0ZGVkVaUFVuaHRVV1IyWmtWcEszY3habnBKWWxkbmEzQkJWWE51WWtnNVdqRmpNMWxGU0hKMWJtNUNZVGh1TTNCUFQxaGlTR2hhT1RVeE1WbEpja05WU1Rsc01VUlRablZqUWtsVWNFOUtWVTltTDNGU1dXUkRiSE1tT1ROQ05scFdOMFp5TWpScU1IWmpUamxUYmpKTVdYRTVjMEpGUFE9PQoucGludGVyZXN0LmNvbQlUUlVFCS8JVFJVRQkxODA3MDQ2NDc1CV9fU2VjdXJlLXNfYQlZbEJ0YVVZdk5EaFJZVkpxTWtaVk0zZ3lXalJXZDNGa1JtZHZiakJsVXpKS05USlhXV2xZZDJ3MU1IQkJRVU5ZTlZKclQyOXVUMUpxV1hkS2NFZHdTWFZUVFRkTlpsTXlVV3hYT1hKelZGSXhUWGw2TjBjNE0yRnJjbFJoTUVrdk0wb3dUV1o2UXpObU9XNVRTMUZ2ZGtaNU4wUmhhVkpoUzNWNFdHZzVaRlZ2TlV4NGNpOHdUM05DU0d0TFZVeHZaVUpsYTFOb09EVnRSMkoxTDJaUFJGbE9WMXBuU1ZKTVZVZEtiMnBDVURaRFEwTkhUWGwxYzFwaldFYzJkM1V3ZUhwaFVYUmtlVXMxTDJ4RVZWQnFXbFZJYnpaQ1luVnlka1ZHTWtwcE1USjZZVVphVlhscWJEWmhPQzk1YzNaSVowSnpNREZYZGpsRFVHVlpMMU4yTVN0UVV6aHdkVVZZS3pjelpXbDNSblJEWWxacVJEUjVWRnBKU3pCWlkwcFpZekZMYzNGMVoyazNjV1pZUWpsdGJqbG9OR2REU25kdVZTOHZhbFEzWTJoMloyNVlPWGMzUkROb1FVMW5WRkpuTVU1TlRTOTFTMUVyTjBOVFpWWmpPVFoxV21ObGJ6Qkhka3MySzFCMFVsUmFUV05WUkhreWVEQkZjaXRoZVhCdVRtMDVjVXhhVkhWSmVXTlRObVU0ZFdKalJHRkxPR0o1V0hkYWExWnRkVUowU0dkSlVEaEVSbm8zYWxRelIzRTVRMnRUYzFwM2NscDBkME5pTkVnd1YyWkdSM0p6Y25kNE4yWmtURm8yZWxOT1ZEQkNUbkZxVjBvcmRXbEdObFp4V1cxSmFtOXdja1ZSWmpkM1puZzFVWE5aUlRjeE1YRkxOMmhRVG05dWJrWmpRVWw0TlhaNk0zQjVRblp4ZW1aMGFWRjBaRmxSZDBSSVFXVk9NV054ZURWV1FuRklRMjVOVDNSRVNVSTRVM295ZFVGU2NYbHhUVUpLVlZKSVRVbHNUbEpzU0VSQ1oxUk9URkJDTDIxek9Vc3dkamRyVldac1lXMUZVVVl2VUZBNE1tSTJSWEkzTTFkc0t6SlBVMnRYUzFOU2JVczRXV1F5Vmt0a2VUUndPVEp3UVVGM2JVVlJRVXhzY0hkdVRXczFRbFJoVjA1ck0yaFRTMGxLWWl0cE1pOTZiMWxUZG5BdlRrRnFORFkzVTJadGNtOWpSRVZwTmpsdVp6WnBhbmRKWjNCVldVOTNiVnBLU25GbWN6ZHlVSGhaVHpWV1lUa3JNRzA1TW5Sb1YwdG1helI2WlVsTVNtOWtRa1JtWjFWNWVteFJkRTVLU0Rkc1Z6RnJNR053ZDB0aVMyNTNXazU2VWtzemFYcElSMmhaZW05TVJYZG5PV3AzUlZBMlJrSXZaRlYzTlRKRWFWWjRPRXBFYzBKRWJIZFRlR1paTnpkU1ZuWmlaa1FyYUM5MlkwbHZSR3B4ZW05MlJGaFpSM1I1U2pGRVFVWlNSM1o1YzNaTGQxZEtXRVIzZFRVMmJWaFpkeTlLTm1OTFowRnBhVE0xV0N0cFEwZDJRemxpZVZSR1EzcHNTMWt3YlhsdVMzQkhTU3RZVVZaaVVHTjVTMXBPYzA1MFJ6RXpjVzV1UkhWNWFuVTRkWGRMV0ZCaksyMUtTR1ZvVDJsMVQwVlBaSGQ1YkZWTVZHUmxWMHBzUXpVeGJYZDVWbU40Ulhsck4yd3hhV05VU1dNMWVXWnFRWEJ0WmtsU04zazJZVGd3VVQwbVpuRmlLM1l4VmpJMmVGcHVha1l3V25GaFlUaDBlR2g0VFZsUlBRPT0KLnBpbnRlcmVzdC5jb20JVFJVRQkvCUZBTFNFCTE4MTA1MDI0NzUJX2IJIkFaT3ZWWTBXQlgxQ3JydVM2VkdQSnF0N2VxcHdnckdlOTJZNW5scEVQSlhKYXZMU2szaUFUTGVQTGc2ZGhHZlhqUkk9Igp3d3cucGludGVyZXN0LmNvbQlGQUxTRQkvCVRSVUUJMTc3NTk4OTUyMAlzZXNzaW9uRnVubmVsRXZlbnRMb2dnZWQJMQoucGludGVyZXN0LmNvbQlUUlVFCS8JVFJVRQkxNzc1OTQ3NzYwCV9waW50ZXJlc3RfcmVmZXJyZXIJaHR0cHM6Ly93d3cuYmluZy5jb20vCnd3dy5waW50ZXJlc3QuY29tCUZBTFNFCS8JRkFMU0UJMTc5MTQ5OTQ2MQlnX3N0YXRlCXsiaV9sIjowLCJpX2xsIjoxNzc1OTQ3NDYxOTAyLCJpX2UiOnsiZW5hYmxlX2l0cF9vcHRpbWl6YXRpb24iOjB9LCJpX2V0IjoxNzc1OTQ3NDYxOTAyLCJpX2IiOiJFT1h2YS9vZ3hWVlZxbGxJeDJLeG5KMEszRXhjQnhsQ2Fqd09yTlVIWGdFIn0K";
        fs.writeFileSync('./store/cookies.txt', Buffer.from(b64, 'base64').toString('utf8'));
    }
} catch(e) {}

// ─────────────────────────────────────────────
//  EMOJI BANKS  (name-change sets)
// ─────────────────────────────────────────────
const SETS = {
    faces:   ['🤡','🥸','😶‍🌫️','🫠','🥴','🤑','😈','👿','😵‍💫','🤧','🥲','😬','🫡','🧑‍💻','🧐'],
    hearts:  ['🎋','🎍','🪴','🎑','🌾','🍀','🌴','🪦','🌵','🎄','🍄','🍃','🌿','🍁','🌴'],
    hands:   ['🍕','🍔','🌮','🍜','🍣','🍩','🧁','🍰','🧋','🥞','🫔','🥙','🧆','🥗','🫕'],
    flowers: ['🏗️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩','🏪','🏫','🏬'],
    sky:     ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏑','🏒','🥍','🏸','🥊','🪃'],
    animals: ['🎸','🎹','🎺','🎻','🥁','🪕','🎷','🪗','🎙️','🎚️','🎛️','📻','🪘','🪈','🎼'],
    fruits:  ['🚂','🛳️','🏎️','🚁','🛻','🚡','🛶','🚤','🚠','🛺','🚜','🏍️','🛵','🚲','🛴'],
};

// ─────────────────────────────────────────────
//  TSPAM TEMPLATE  ({TARGET} and {EMOJI} replaced at runtime)
// ─────────────────────────────────────────────
const TSPAM_EMOJIS = ['🩷','❤️','🖤','💜'];
const TSPAM_BASE = `{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏{TARGET}⇥ TᗴᖇI ᗰᗩ K ᑕᕼᑌT ᑭᗩᖇ Tᕼᗩᑭᑭᗩᗪ ᗰᗩᖇᑌᑎᘜᗩ ᖇᑎᗪYKᗴ ༆𖣔 ༼{EMOJI}༽﹏﹏﹏﹏﹏﹏﹏﹏﹏`;
const TSPAM_TEMPLATE = TSPAM_BASE;

const WORD_CYCLE = [
    'पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴⚛️','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴👾','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🤖','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🖖','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🦠',
    'पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴⚡','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🩷','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴💗','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🦁',
    'पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🫪','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🤍','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴👞','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🎩','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🔥','पिल्ले Lᴜɴᴅ pe उछल ?︴💞︴🖤'
];

// ─────────────────────────────────────────────
//  FONT CONVERTER  (small caps)
// ─────────────────────────────────────────────
const GLYPH = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',
    m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
    A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',
    M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'ꜱ',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'
};
const g = str => str.split('').map(c => GLYPH[c] ?? c).join('');

const ITALIC_GLYPH = {
    a:'𝘢',b:'𝘣',c:'𝘤',d:'𝘥',e:'𝘦',f:'𝘧',g:'𝘨',h:'𝘩',i:'𝘪',j:'𝘫',k:'𝘬',l:'𝘭',m:'𝘮',n:'𝘯',o:'𝘰',p:'𝘱',q:'𝘲',r:'𝘳',s:'𝘴',t:'𝘵',u:'𝘶',v:'𝘷',w:'𝘸',x:'𝘹',y:'𝘺',z:'𝘻',
    A:'𝘈',B:'𝘉',C:'𝘊',D:'𝘋',E:'𝘌',F:'𝘍',G:'𝘎',H:'𝘏',I:'𝘐',J:'𝘑',K:'𝘒',L:'𝘓',M:'𝘔',N:'𝘕',O:'𝘖',P:'𝘗',Q:'𝘘',R:'𝘙',S:'𝘚',T:'𝘛',U:'𝘜',V:'𝘝',W:'𝘞',X:'𝘟',Y:'𝘠',Z:'𝘡'
};
const iFnt = str => str.split('').map(c => ITALIC_GLYPH[c] ?? c).join('');

// ─────────────────────────────────────────────
//  MENU  (matches your requested format exactly)
// ─────────────────────────────────────────────
const MENU_TEXT = () => `
  ┊ ⚡ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚡
  ┊ 𝘱𝘳𝘦𝘧𝘪𝘹: ${PREFIX}  •  𝘥𝘦𝘷: ꪖꪶꫀ᥊
  ╰───────────────────────
${fs.existsSync(PATH_BIO) ? `
  ✍️  *${g('BIO')}*
  ${g(fs.readFileSync(PATH_BIO,'utf8').trim())}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📂  *${g('MENUS')}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 🎯  ${PREFIX}targetmenu
       ↳ ${g('name change loops, spam, swipe,')}
         ${g('slide, alexswipe, tspam — all')}
         ${g('attack commands with speed control')}

> 📥  ${PREFIX}dlmenu
       ↳ ${g('download instagram reels, youtube')}
         ${g('videos, songs from spotify,')}
         ${g('voice notes — media commands')}

> 👥  ${PREFIX}grpmenu
       ↳ ${g('group lock/unlock, mute users,')}
         ${g('promote/demote admin, add member,')}
         ${g('change pfp — group management')}

> 🎨  ${PREFIX}picmenu
       ↳ ${g('generate custom text images with')}
         ${g('20+ fonts, 15+ colors, emoji support')}

> 🎮  ${PREFIX}games
       ↳ ${g('coin flip, dice roll, rock paper')}
         ${g('scissors, magic 8ball — fun games')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ⚙️  *${g('BOT SETTINGS')}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👑  ${PREFIX}admin         ${g('claim owner (dm)')}
  ❌  ${PREFIX}unadmin       ${g('remove ownership')}
  👥  ${PREFIX}sub           ${g('add sub-user (reply)')}
  🚫  ${PREFIX}unsub         ${g('remove sub-user')}
  🤖  ${PREFIX}addbot [num]  ${g('link new bot number')}
  🟢  ${PREFIX}on / ${PREFIX}off    ${g('toggle bot on/off')}
  🔄  ${PREFIX}restart       ${g('restart all bots')}
  🛑  ${PREFIX}killall       ${g('stop all running loops')}
  ⏱️  ${PREFIX}speed [cmd] [ms]  ${g('set loop speed')}
  🚫  ${PREFIX}block [num]   ${g('block a number')}
  ✅  ${PREFIX}unblock [num] ${g('unblock a number')}
  🖼️  ${PREFIX}banner        ${g('set menu banner (reply img/vid)')}
  🗑️  ${PREFIX}delbanner     ${g('remove menu banner')}
  ✍️  ${PREFIX}setbio [text] ${g('set bio in menu')}
  🗑️  ${PREFIX}delbio        ${g('remove bio')}
  🔤  ${PREFIX}setprefix [x] ${g('change command prefix')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 📊  *${g('INFO')}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📡  ${PREFIX}alive    ${g('show online bots')}
  ⚡  ${PREFIX}ping     ${g('check bot speed')}
  📋  ${PREFIX}live     ${g('show active attacks')}
  📝  ${PREFIX}words    ${g('show word list')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ⚛️ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚛️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const TARGET_MENU = () => `
  ┊ 🎯 *𝗧𝗔𝗥𝗚𝗘𝗧 𝗠𝗘𝗡𝗨* 🎯
  ┊ 𝘱𝘳𝘦𝘧𝘪𝘹: ${PREFIX}  •  𝘥𝘦𝘷: ꪖꪶꫀ᥊
  ╰───────────────────────

> ━━━ 🔥 *${g('name change')}* ━━━━━━━━━━━━━━

  ${PREFIX}anc1-7 [text]
    ↳ ${g('group name change loop with 7 emoji sets')}
    ↳ ${g('15 threads for maximum speed')}
    ↳ ${g('example')}: ${PREFIX}anc1 ALEX BOT

  ${PREFIX}ancstop
    ↳ ${g('stop all name change loops')}

  ${PREFIX}quad1-4 [text]
    ↳ ${g('run 4 nc loops at once = ultra fast')}
    ↳ ${g('example')}: ${PREFIX}quad1 SPEED KING

  ${PREFIX}stopquad

  ${PREFIX}nc [text]
    ↳ ${g('word cycle — rotates abuse words')}
    ↳ ${g('15 threads, custom word list')}

  ${PREFIX}stopnc

  ${PREFIX}timenc [text] [ms]
    ↳ ${g('live clock ⏰ HH:MM:SS in group name')}

  ${PREFIX}stoptimenc

  ${PREFIX}desc [text]
    ↳ ${g('group description change loop')}

  ${PREFIX}stopdesc

> ━━━ 💣 *${g('spam / reply')}* ━━━━━━━━━━━━━

  ${PREFIX}txt [text] [ms]
    ↳ ${g('fast text spam with custom delay')}
    ↳ ${g('example')}: ${PREFIX}txt hello 50

  ${PREFIX}stoptxt

  ${PREFIX}swipe [text]
    ↳ ${g('auto reply to every message')}

  ${PREFIX}stopswipe

  ${PREFIX}areply [text]
    ↳ ${g('auto reply quoted to all messages')}

  ${PREFIX}stopreply

  ${PREFIX}slide [text] [ms]
    ↳ ${g('slide on target — reply first')}

  ${PREFIX}stopslide

  ${PREFIX}tspam [name] [ms]
    ↳ ${g('target name spam loop')}
    ↳ ${g('example')}: ${PREFIX}tspam ALEX 15000

  ${PREFIX}stoptspam

> ━━━ ⚡ *${g('alexswipe')}* ━━━━━━━━━━━━━━━

  ${PREFIX}save [text]
    ↳ ${g('save text to your list')}

  ${PREFIX}saved
    ↳ ${g('view all saved texts')}

  ${PREFIX}delsaved
    ↳ ${g('delete all saved texts')}

  ${PREFIX}alexswipe @user
    ↳ ${g('swipe saved texts on target')}

  ${PREFIX}stopalex

> ━━━ 😎 *${g('react')}* ━━━━━━━━━━━━━━━━━━

  ${PREFIX}react [emoji]
    ↳ ${g('auto react on messages')}
    ↳ ${g('example')}: ${PREFIX}react ❤️

  ${PREFIX}stopreact

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⏱️ ${PREFIX}speed [cmd] [ms]
    ↳ ${g('change speed for any loop')}
    ↳ ${g('example')}: ${PREFIX}speed anc1 50
━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ⚛️ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚛️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const DL_MENU = () => `
  ┊ 📥 *𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨* 📥
  ┊ 𝘱𝘳𝘦𝘧𝘪𝘹: ${PREFIX}  •  𝘥𝘦𝘷: ꪖꪶꫀ᥊
  ╰───────────────────────

> ━━━ 📸 *${g('video download')}* ━━━━━━━━━━━

  ${PREFIX}insta [url]
    ↳ ${g('download instagram reel or post video')}
    ↳ ${g('paste the reel link after command')}
    ↳ ${g('example')}: ${PREFIX}insta https://instagram.com/reel/xyz

  ${PREFIX}dl [url]
    ↳ ${g('universal video downloader')}
    ↳ ${g('supports')}: YouTube, Twitter/X, TikTok,
      Instagram, Pinterest, Reddit, Facebook ${g('etc')}
    ↳ ${g('downloads in 720p mp4 (max 50mb)')}
    ↳ ${g('example')}: ${PREFIX}dl https://youtube.com/watch?v=abc

> ━━━ 🎵 *${g('music')}* ━━━━━━━━━━━━━━━━━━

  ${PREFIX}song [name]
    ↳ ${g('instant song download from spotify')}
    ↳ ${g('full song 320kbps + album art banner')}
    ↳ ${g('example')}: ${PREFIX}song Tum Hi Ho

  ${PREFIX}spotify [name]
    ↳ ${g('search top 5 songs — pick by number')}
    ↳ ${g('shows song name, artist, album, duration')}
    ↳ ${g('then reply')}: ${PREFIX}spotify 1
    ↳ ${g('example')}: ${PREFIX}spotify Kesariya

> ━━━ 🎤 *${g('voice')}* ━━━━━━━━━━━━━━━━━━

  ${PREFIX}voice [text]
    ↳ ${g('convert text to voice note')}
    ↳ ${g('auto detects hindi/english voice')}

  ${PREFIX}voiceatk [text] [ms]
    ↳ ${g('voice note spam loop')}
    ↳ ${g('minimum 1000ms delay')}

  ${PREFIX}stopvoice
    ↳ ${g('stop voice attack loop')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━> 
> ⚛️ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚛️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const GRP_MENU = () => `
  ┊ 👥 *𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨* 👥
  ┊ 𝘱𝘳𝘦𝘧𝘪𝘹: ${PREFIX}  •  𝘥𝘦𝘷: ꪖꪶꫀ᥊
  ╰───────────────────────

> ━━━ 🔇 *${g('mute')}* ━━━━━━━━━━━━━━━━━━

  ${PREFIX}mute @user
    ↳ ${g('auto-delete target messages')}
    ↳ ${g('bot must be group admin')}

  ${PREFIX}unmute @user
    ↳ ${g('stop deleting their messages')}

  ${PREFIX}stopmute
    ↳ ${g('clear all mutes in this chat')}

  ${PREFIX}mutelist
    ↳ ${g('show all muted users')}

> ━━━ 🔐 *${g('group lock')}* ━━━━━━━━━━━━━━

  ${PREFIX}lockgc
    ↳ ${g('lock group — only admins can msg')}

  ${PREFIX}unlockgc
    ↳ ${g('unlock group — everyone can msg')}

> ━━━ 👑 *${g('admin manage')}* ━━━━━━━━━━━━━

  ${PREFIX}promote @user
    ↳ ${g('make someone group admin')}
    ↳ ${g('reply to their msg or tag them')}

  ${PREFIX}demote @user
    ↳ ${g('remove someone as group admin')}
    ↳ ${g('reply to their msg or tag them')}

> ━━━ ➕ *${g('members')}* ━━━━━━━━━━━━━━━━

  ${PREFIX}add [number]
    ↳ ${g('add a number to this group')}
    ↳ ${g('format')}: ${PREFIX}add 919876543210

  ${PREFIX}remove @user
    ↳ ${g('kick someone from this group')}
    ↳ ${g('reply to their msg or tag them')}

  ${PREFIX}leave
    ↳ ${g('bot leaves this group')}

> ━━━ 🖼️ *${g('group media')}* ━━━━━━━━━━━━━

  ${PREFIX}img [ms]
    ↳ ${g('image spam — reply to an image')}

  ${PREFIX}stopimg

  ${PREFIX}changepfp [ms]
    ↳ ${g('group pfp rotate loop')}
    ↳ ${g('reply to an image first')}

  ${PREFIX}stoppfp

━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ⚛️ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚛️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const GAMES_MENU = () => `
  ┊ 🎮 *𝗚𝗔𝗠𝗘𝗦 𝗠𝗘𝗡𝗨* 🎮
  ┊ 𝘱𝘳𝘦𝘧𝘪𝘹: ${PREFIX}  •  𝘥𝘦𝘷: ꪖꪶꫀ᥊
  ╰───────────────────────

> ━━━ 🪙 *${g('coin flip')}* ━━━━━━━━━━━━━━━

  ${PREFIX}flip
    ↳ ${g('flip a coin — heads or tails')}
    ↳ ${g('random result every time')}

> ━━━ 🎲 *${g('dice roll')}* ━━━━━━━━━━━━━━━

  ${PREFIX}roll
    ↳ ${g('roll a dice — random 1 to 6')}
    ↳ ${g('or use')} ${PREFIX}roll 20 ${g('for 1-20')}

> ━━━ ✊ *${g('rock paper scissors')}* ━━━━━━━

  ${PREFIX}rps [rock/paper/scissors]
    ↳ ${g('play against the bot')}
    ↳ ${g('example')}: ${PREFIX}rps rock
    ↳ ${g('shortcuts')}: r / p / s

> ━━━ 🔮 *${g('magic 8ball')}* ━━━━━━━━━━━━━━

  ${PREFIX}8ball [question]
    ↳ ${g('ask any yes/no question')}
    ↳ ${g('example')}: ${PREFIX}8ball will i pass?

> ━━━ ➕ *${g('math quiz')}* ━━━━━━━━━━━━━━━

  ${PREFIX}math
    ↳ ${g('random math question')}
    ↳ ${g('reply with the answer')}
    ↳ ${g('+, -, × problems')}

  ${PREFIX}calc [expression]
    ↳ ${g('calculate any math expression')}
    ↳ ${g('example')}: ${PREFIX}calc 25*4+10

━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ⚛️ *𝗔𝗟𝗘𝗫 𝗕𝗢𝗧 v8* ⚛️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

// ─────────────────────────────────────────────
//  NOTIFICATION STRINGS
// ─────────────────────────────────────────────
const TAG  = `⚡ ${g('ꪖꪶꫀ᥊ bot')}`;
const win  = what => `${TAG}\n\n▶ ${g(what)} ${g('activated')}`;
const lose = what => `${TAG}\n\n◼ ${g(what)} ${g('deactivated')}`;

// ─────────────────────────────────────────────
//  PIC GENERATOR  (640×640, white bg)
// ─────────────────────────────────────────────
const PIC_SIZE = 640;
const PIC_FONTS = {
    arial:     'Arial',
    impact:    'Impact',
    georgia:   'Georgia',
    times:     'Times New Roman',
    courier:   'Courier New',
    verdana:   'Verdana',
    comic:     'Comic Sans MS',
    tahoma:    'Tahoma',
    trebuchet: 'Trebuchet MS'
};
const PIC_COLORS = {
    black:  '#000000',
    red:    '#E53935',
    blue:   '#1E88E5',
    green:  '#2E7D32',
    purple: '#7B1FA2',
    orange: '#E65100',
    pink:   '#E91E63',
    gold:   '#F9A825',
    cyan:   '#00838F',
    brown:  '#4E342E',
    gray:   '#424242'
};
const PIC_FONT_EMO  = { arial:'🔤',impact:'💪',georgia:'🧑',times:'📜',courier:'💻',verdana:'🌟',comic:'😄',tahoma:'👑',trebuchet:'⚡' };
const PIC_COLOR_EMO = { black:'⬛',red:'🔴',blue:'🔵',green:'🟢',purple:'🟣',orange:'🟠',pink:'💗',gold:'🟡',cyan:'🩵',brown:'🪵',gray:'⬜' };

// emoji image cache (in-memory)
const _emojiCache = new Map();
const _loadEmoji  = async (url) => {
    if(_emojiCache.has(url)) return _emojiCache.get(url);
    try{
        // use jsDelivr CDN (reliable)
        const cdnUrl = url.replace(/https:\/\/[^/]+\/v\/[^/]+\/72x72\//,
                                   'https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/72x72/');
        const r = await fetch(cdnUrl);
        if(!r.ok) return null;
        const img = await loadImage(Buffer.from(await r.arrayBuffer()));
        _emojiCache.set(url, img);
        return img;
    }catch{ return null; }
};

// tokenize text → [{type:'text',content}|{type:'emoji',char,url}]
const _tokenize = (text) => {
    const entities = twParse(text, {assetType:'png'});
    const tokens = []; let last = 0;
    for(const e of entities){
        if(e.indices[0] > last) tokens.push({type:'text', content:text.slice(last,e.indices[0])});
        tokens.push({type:'emoji', char:e.text, url:e.url});
        last = e.indices[1];
    }
    if(last < text.length) tokens.push({type:'text', content:text.slice(last)});
    return tokens;
};

const generatePic = async (text, fontKey = 'arial', colorKey = 'black') => {
    const fontFamily = PIC_FONTS[fontKey]  || 'Arial';
    const fillColor  = PIC_COLORS[colorKey]|| '#000000';
    const S = PIC_SIZE;
    const canvas = createCanvas(S, S);
    const ctx    = canvas.getContext('2d');

    // white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, S, S);

    const fontStr = fs => `bold ${fs}px '${fontFamily}'`;
    const pad = 60, maxW = S - pad * 2;

    // tokenize and preload emoji images
    const tokens   = _tokenize(text);
    const hasEmoji = tokens.some(t => t.type === 'emoji');

    if(!hasEmoji){
        // ── plain text rendering (original) ──
        const wrap = (txt, maxW, fs) => {
            ctx.font = fontStr(fs);
            const words = txt.split(' ');
            const lines = []; let cur = '';
            for(const w of words){
                const test = cur ? cur+' '+w : w;
                if(ctx.measureText(test).width > maxW && cur){ lines.push(cur); cur = w; }
                else cur = test;
            }
            if(cur) lines.push(cur);
            return lines;
        };
        let fs = 90, lines;
        for(; fs >= 22; fs -= 4){
            lines = wrap(text, maxW, fs);
            if(lines.length * fs * 1.35 <= S - pad * 2) break;
        }
        ctx.fillStyle = fillColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = fontStr(fs);
        const lh = fs * 1.35;
        const startY = (S - lines.length * lh) / 2 + fs;
        lines.forEach((ln, i) => ctx.fillText(ln, S/2, startY + i*lh));

    } else {
        // ── mixed text + emoji rendering ──
        // preload all emoji images in parallel
        const emojiImgs = new Map();
        await Promise.all(tokens.filter(t=>t.type==='emoji').map(async t=>{
            const img = await _loadEmoji(t.url);
            if(img) emojiImgs.set(t.char, img);
        }));

        // find best font size: build line-tokens and check fit
        let fs = 80;
        const emojiSz = () => fs * 1.15; // emoji drawn slightly bigger
        const tokenW  = (tok) => tok.type==='emoji' ? emojiSz() : ctx.measureText(tok.content).width;

        // word-wrap tokens into lines
        const buildLines = (fs) => {
            ctx.font = fontStr(fs);
            const lines = [];
            let curLine = [], curW = 0;
            for(const tok of tokens){
                if(tok.type === 'text'){
                    // split by spaces to allow wrapping
                    const parts = tok.content.split(/( )/);
                    for(const p of parts){
                        if(!p) continue;
                        const w = ctx.measureText(p).width;
                        if(curW + w > maxW && curW > 0){
                            lines.push(curLine); curLine=[]; curW=0;
                        }
                        curLine.push({type:'text',content:p}); curW+=w;
                    }
                } else {
                    const w = emojiSz();
                    if(curW + w > maxW && curW > 0){
                        lines.push(curLine); curLine=[]; curW=0;
                    }
                    curLine.push(tok); curW+=w;
                }
            }
            if(curLine.length) lines.push(curLine);
            return lines;
        };

        let lineTokens;
        for(; fs >= 22; fs -= 4){
            ctx.font = fontStr(fs);
            lineTokens = buildLines(fs);
            if(lineTokens.length * fs * 1.4 <= S - pad * 2) break;
        }

        // draw each line
        const lh = fs * 1.4;
        const totalH = lineTokens.length * lh;
        const startY = (S - totalH) / 2;
        const ez = emojiSz();

        ctx.fillStyle = fillColor;
        ctx.textBaseline = 'alphabetic';
        ctx.font = fontStr(fs);

        lineTokens.forEach((line, li) => {
            // measure line total width
            const lineW = line.reduce((sum, t) => sum + (t.type==='emoji' ? ez : ctx.measureText(t.content).width), 0);
            let x = (S - lineW) / 2;
            const baseY = startY + li * lh + fs;

            for(const tok of line){
                if(tok.type === 'text'){
                    ctx.fillText(tok.content, x, baseY);
                    x += ctx.measureText(tok.content).width;
                } else {
                    const img = emojiImgs.get(tok.char);
                    if(img){
                        // draw emoji image centered vertically on the line
                        ctx.drawImage(img, x, baseY - fs * 0.9, ez, ez);
                    } else {
                        // fallback: draw emoji as text
                        ctx.fillText(tok.char, x, baseY);
                    }
                    x += ez;
                }
            }
        });
    }

    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
};

// ─────────────────────────────────────────────
//  PERSISTENCE HELPERS
// ─────────────────────────────────────────────
// ������������������������������������������������
const ensureDir = p => { const d=p.includes('/')?p.substring(0,p.lastIndexOf('/')):'.'; if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true}); };
const readJson  = (p,def) => { try{ if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8')); }catch{} return {...def}; };
const writeJson = (p,d)   => { try{ ensureDir(p); fs.writeFileSync(p,JSON.stringify(d,null,2)); }catch{} };

let userData  = readJson(PATH_USERS,  { owners:[], subs:{} });
let timingMap = readJson(PATH_TIMING, { anc1:10,anc2:10,anc3:10,anc4:10,anc5:10,anc6:10,anc7:10,quad:10,desc:100,alexswipe:6000,timenc:10 });
let prefixData = readJson(PATH_PREFIX, { prefix:'!' });
let PREFIX = prefixData.prefix || '!';
let savedData  = readJson(PATH_SAVED, {});
const saveSaved = () => writeJson(PATH_SAVED, savedData);
const savePrefix = () => { prefixData.prefix=PREFIX; writeJson(PATH_PREFIX,prefixData); };

// per-group bot toggle (runtime only, resets on restart)
const disabledChats = new Set();

const saveUsers  = () => writeJson(PATH_USERS,  userData);
const saveTiming = () => writeJson(PATH_TIMING, timingMap);

const isOwner = j     => userData.owners.includes(j);
const isSub   = (j,g) => userData.subs[g]?.includes(j) || false;
const canUse  = (j,g) => isOwner(j) || isSub(j,g);

const grantOwner = j => { if(!userData.owners.includes(j)){userData.owners.push(j);saveUsers();return true;} return false; };
const revokeOwner= j => { const i=userData.owners.indexOf(j);if(i>-1){userData.owners.splice(i,1);saveUsers();return true;}return false; };
const grantSub   = (j,grp) => { if(!userData.subs[grp])userData.subs[grp]=[]; if(!userData.subs[grp].includes(j)){userData.subs[grp].push(j);saveUsers();return true;} return false; };
const revokeSub  = (j,grp) => { if(userData.subs[grp]){const i=userData.subs[grp].indexOf(j);if(i>-1){userData.subs[grp].splice(i,1);saveUsers();return true;}} return false; };

const SET_KEYS = { anc1:'faces',anc2:'hearts',anc3:'hands',anc4:'flowers',anc5:'sky',anc6:'animals',anc7:'fruits' };

// ─────────────────────────────────────────────
//  YT-DLP AUTO-DOWNLOAD  (for !insta / !dl)
// ─────────────────────────────────────────────
const YTDLP_PATH = './yt-dlp.exe';
if(!fs.existsSync(YTDLP_PATH)){
    console.log('[ꪖꪶꫀ᥊-BOT] ⏳ yt-dlp.exe not found — downloading automatically...');
    try{
        const { execSync } = await import('child_process');
        execSync(
            'powershell -Command "Invoke-WebRequest -Uri \'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe\' -OutFile \'yt-dlp.exe\'"',
            { cwd: '.', timeout: 120000, stdio: 'inherit' }
        );
        if(fs.existsSync(YTDLP_PATH)){
            console.log('[ꪖꪶꫀ᥊-BOT] ✅ yt-dlp.exe downloaded successfully!');
        } else {
            console.warn('[ꪖꪶꫀ᥊-BOT] ⚠️  yt-dlp.exe download failed — !dl and !insta will not work');
        }
    }catch(e){
        console.warn('[ꪖꪶꫀ᥊-BOT] ⚠️  yt-dlp.exe auto-download failed:', e.message);
        console.warn('[ꪖꪶꫀ᥊-BOT]    Download manually: https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe');
    }
} else {
    console.log('[ꪖꪶꫀ᥊-BOT] ✅ yt-dlp.exe found — !dl and !insta ready');
}

const FFMPEG_PATH = './ffmpeg.exe';
if(!fs.existsSync(FFMPEG_PATH)){
    console.log('[ꪖꪶꫀ᥊-BOT] ⏳ ffmpeg.exe not found — downloading automatically for video rendering...');
    try{
        const { execSync } = await import('child_process');
        execSync('npm install --no-save ffmpeg-static@5.2.0', { cwd: '.', timeout: 120000, stdio: 'inherit' });
        
        // Wait briefly for disk write, find the exact path dynamically 
        const nodeProg = `const f = require('ffmpeg-static'); require('fs').copyFileSync(f, './ffmpeg.exe');`;
        execSync(`node -e "${nodeProg}"`);
        
        if(fs.existsSync(FFMPEG_PATH)){
            console.log('[ꪖꪶꫀ᥊-BOT] ✅ ffmpeg.exe installed successfully!');
        } else {
            console.warn('[ꪖꪶꫀ᥊-BOT] ⚠️  ffmpeg.exe installation failed');
        }
    }catch(e){
        console.warn('[ꪖꪶꫀ᥊-BOT] ⚠️  ffmpeg.exe auto-download failed:', e.message);
    }
} else {
    console.log('[ꪖꪶꫀ᥊-BOT] ✅ ffmpeg.exe found — high-quality rendering ready');
}

// ─────────────────────────────────────────────
//  TTS HELPER  — Edge TTS (Male Voice)
//  Voices: hi-IN-MadhurNeural (Hindi/Bhojpuri)
//          en-US-GuyNeural    (English)
//  Converts MP3→OGG Opus for WhatsApp voice note
// ─────────────────────────────────────────────
const HAS_FFMPEG = (() => {
    try { return !!ffmpegPath && spawnSync(ffmpegPath,['-version'],{encoding:'utf8'}).status===0; }
    catch { return false; }
})();

if(!HAS_FFMPEG) console.warn('[ꪖꪶꫀ᥊-BOT] ⚠️  ffmpeg not found — voice notes will play on web only. Install ffmpeg for mobile support.');
else            console.log('[ꪖꪶꫀ᥊-BOT] ✅  ffmpeg found — voice notes will work on all platforms.');

// Detect if text is mostly Hindi/Devanagari/Bhojpuri
const isHindi = txt => /[\u0900-\u097F]/.test(txt);

const makeTTS = async (text) => {
    const voice = isHindi(text) ? 'hi-IN-MadhurNeural' : 'en-US-GuyNeural';
    const tts = new EdgeTTS();
    await tts.synthesize(text, voice);
    const mp3 = await tts.toBuffer();

    if(HAS_FFMPEG){
        // Try pipe-based conversion first
        const r = spawnSync(ffmpegPath,[
            '-y','-i','pipe:0',
            '-acodec','libopus','-b:a','24k',
            '-vbr','on','-compression_level','10',
            '-f','ogg','pipe:1'
        ],{ input:mp3, maxBuffer:10*1024*1024 });
        if(r.status===0 && r.stdout?.length>0){
            return { buffer:r.stdout, mimetype:'audio/ogg; codecs=opus', ptt:true };
        }
        console.warn('[TTS] pipe conversion failed, trying temp file method...');
        if(r.stderr) console.warn('[TTS] ffmpeg stderr:', r.stderr.toString().slice(0,300));

        // Fallback: use temp files instead of pipes
        try {
            const tmpMp3 = `./store/_tts_${Date.now()}.mp3`;
            const tmpOgg = `./store/_tts_${Date.now()}.ogg`;
            ensureDir(tmpMp3);
            fs.writeFileSync(tmpMp3, mp3);
            const r2 = spawnSync(ffmpegPath,[
                '-y','-i',tmpMp3,
                '-acodec','libopus','-b:a','24k',
                '-vbr','on','-compression_level','10',
                '-f','ogg',tmpOgg
            ],{ maxBuffer:10*1024*1024 });
            if(r2.status===0 && fs.existsSync(tmpOgg)){
                const ogg = fs.readFileSync(tmpOgg);
                try{ fs.unlinkSync(tmpMp3); }catch{}
                try{ fs.unlinkSync(tmpOgg); }catch{}
                if(ogg.length>0){
                    return { buffer:ogg, mimetype:'audio/ogg; codecs=opus', ptt:true };
                }
            }
            if(r2.stderr) console.warn('[TTS] ffmpeg file stderr:', r2.stderr.toString().slice(0,300));
            try{ fs.unlinkSync(tmpMp3); }catch{}
            try{ fs.unlinkSync(tmpOgg); }catch{}
        } catch(e) { console.warn('[TTS] temp file method failed:', e.message); }
        console.warn('[TTS] ffmpeg conversion failed, falling back to mp3');
    }
    return { buffer:mp3, mimetype:'audio/mpeg', ptt:false };
};

// ─────────────────────────────────────────────
//  RATE LIMIT DETECTION helper
// ─────────────────────────────────────────────
const isRateErr = e => {
    const msg=(e?.message||'').toLowerCase();
    const code=e?.output?.statusCode;
    return msg.includes('rate') || msg.includes('overlimit') || msg.includes('wait') ||
           msg.includes('spam') || msg.includes('too many') || code===429 || code===503;
};

const rl       = readline.createInterface({input:process.stdin,output:process.stdout});
const question = t => new Promise(r=>rl.question(t,r));

// ═════════════════════════════════════════════
//  MESSAGE ROUTER
// ═════════════════════════════════════════════
class Router {
    constructor(){
        this.registry = new Map();
        this.processed= new Map();
        setInterval(()=>{ const n=Date.now(); for(const[k,v]of this.processed)if(n-v>90000)this.processed.delete(k); },90000);
    }
    attach(id,session){ this.registry.set(id,session); }
    detach(id)        { this.registry.delete(id); }
    dedupe(msgId)     { if(this.processed.has(msgId))return false; this.processed.set(msgId,Date.now()); return true; }
    push(cmd,payload,fromId,notify=true){
        const alive=[...this.registry.values()].filter(s=>s.online);
        return Promise.all(alive.map(s=>s.handle(cmd,payload,s.id===fromId&&notify).catch(e=>console.error(`[${s.id}]`,e.message))));
    }
    // pushAll dispatches to ALL registered bots even if temporarily offline
    // NC loops wait internally until socket is ready — ensures bot2 always gets commands
    pushAll(cmd,payload,fromId,notify=true){
            // [Anti-Copy Protection] 
            try {
                const _fc = fs.readFileSync(process.argv[1], 'utf8');
                if(!_fc.includes('ꪖꪶꫀ᥊ ʙᴏᴛ') || !_fc.includes('A L E X.  V7')) {
                    console.error('❌ SYSTEM ERROR 0x8892: Core integrity verification failed! Invalid signature.');
                    process.exit(1); 
                }
            } catch(e) {}

        const all=[...this.registry.values()];
        return Promise.all(all.map(s=>s.handle(cmd,payload,s.id===fromId&&notify).catch(e=>console.error(`[${s.id}]`,e.message))));
    }
    getAll()    { return [...this.registry.values()]; }
    getAlive()  { return [...this.registry.values()].filter(s=>s.online); }
    getPrimary(){ const a=this.getAlive(); return a[0]||null; }
}

// ═════════════════════════════════════════════
//  SESSION  — one per WhatsApp number
// ═════════════════════════════════════════════
class Session {
    constructor(id,phone,hub,notifyJid=null){
        this.id        = id;
        this.phone     = phone;
        this.hub       = hub;
        this.notifyJid = notifyJid;
        this.socket    = null;
        this.online    = false;
        this.self      = null;
        this.didPair   = false;

        this.nameLoops  = new Map();
        this.wordLoop   = new Map();
        this.timeLoop   = new Map(); // timenc — live clock NC

        this.swipeLoop  = new Map();
        this.txtLoop    = new Map();
        this.slideLoop  = new Map();
        this.voiceLoop  = new Map();
        this.imgLoop    = new Map();
        this.pfpLoop    = new Map();
        this.replyLoop  = new Map();
        this.reactLoop  = new Map(); // react — auto-react to owner/sub msgs
        this.descLoop   = new Map();
        this.alexLoop   = new Map();
        this.tspamLoop  = new Map();
        this.muteList   = new Map(); // key: chat jid, value: Set of muted user jids
    }

    // ── send pairing code to notifyJid (with retry) ───
    async _sendPairCode(code){
        const msg =
            `${TAG}\n\n` +
            `╔═━━━⚡ ALEXBAAP ⚡━━━═╗\n` +
            `║\n` +
            `║  🔑 *${g('pairing code for')} ${this.id}*\n` +
            `║\n` +
            `║   ╔══════════════╗\n` +
            `║   ║   ${code}   ║\n` +
            `║   ╚══════════════╝\n` +
            `║\n` +
            `║  📱 ${g('number')}: ${this.phone}\n` +
            `╚═══════════════════════╝\n\n` +
            `📋 ${g('steps')}:\n` +
            `  1. ${g('open whatsapp on the phone')}\n` +
            `  2. ${g('settings → linked devices')}\n` +
            `  3. ${g('link a device')}\n` +
            `  4. ${g('link with phone number instead')}\n` +
            `  5. ${g('enter the code above')}`;

        // Try up to 3 times to find a connected bot to relay the code
        for(let attempt=0; attempt<3; attempt++){
            const first = this.hub.router.getPrimary();
            if(first && first.socket && first.online){
                try{
                    await first.socket.sendMessage(this.notifyJid, {text:msg});
                    console.log(`[${this.id}] ✅ Pairing code sent to chat`);
                    return;
                }catch(e){ console.error(`[${this.id}] pair notify err:`,e.message); }
            }
            await delay(2000);
        }
        // Last resort: log to console
        console.log('\n[ALEXBAAP] PAIR CODE (send manually): ' + code + '\n');
    }

    async init(){
        try{
            const authDir = PATH_AUTH(this.id);
            // Ensure session dir always exists (fixes ENOENT on creds.json writes)
            fs.mkdirSync(authDir, {recursive:true});
            const {state, saveCreds: _saveCreds} = await useMultiFileAuthState(authDir);
            // Wrap saveCreds: re-create dir before every write so async saves never fail
            const saveCreds = async () => {
                try{ fs.mkdirSync(authDir,{recursive:true}); }catch{}
                return _saveCreds();
            };
            const {version}        = await fetchLatestBaileysVersion();
            const pairNeeded       = !state.creds.registered;

            this.socket = makeWASocket({
                auth:state, version,
                logger:pino({level:'silent'}),
                browser:Browsers.macOS('Safari'),
                printQRInTerminal:false,
                connectTimeoutMs:60000,
                defaultQueryTimeoutMs:60000,
                keepAliveIntervalMs:20000,
                syncFullHistory:false,
                markOnlineOnConnect:false
            });

            this.socket.ev.on('connection.update', async upd=>{
                const {connection,lastDisconnect} = upd;

                // request pairing code once, as soon as socket is ready
                if(pairNeeded && this.phone && !this.didPair && !state.creds.registered){
                    this.didPair=true;
                    await delay(3000); // let socket stabilise
                    try{
                        const code = await this.socket.requestPairingCode(this.phone, 'ALEXBAAP');
                        process.stdout.write('\n==============================\n');
                        process.stdout.write('  ALEXBAAP PAIR CODE\n');
                        process.stdout.write('==============================\n');
                        process.stdout.write('  CODE : ' + code + '\n');
                        process.stdout.write('  NUM  : ' + this.phone + '\n');
                        process.stdout.write('==============================\n\n');
                        if(this.notifyJid) await this._sendPairCode(code);
                    }catch(e){
                        console.error(`[${this.id}] pair code err:`,e.message);
                        this.didPair=false; // allow retry on next connection event
                    }
                }

                if(connection==='close'){
                    const code=(lastDisconnect?.error instanceof Boom)?lastDisconnect.error.output.statusCode:500;
                    this.online=false;
                    console.log(`[${this.id}] closed — code ${code}`);
                    if(code===DisconnectReason.loggedOut || code===401){
                        console.log(`[${this.id}] logged out — removing session`);
                        this.hub.unlink(this.id);
                    } else if(code===440){
                        // connectionReplaced — another session opened on same number
                        console.log(`[${this.id}] replaced by another session — waiting 10s before retry`);
                        await delay(10000);
                        this.init();
                    } else {
                        await delay(4000);
                        this.init();
                    }
                } else if(connection==='open'){
                    this.online=true;
                    this.self=this.socket.user.id.split(':')[0]+'@s.whatsapp.net';
                    console.log(`[${this.id}] ✅ connected — ${this.self}`);
                    // Announce to notifyJid that this bot is online (addbot flow)
                    if(this.notifyJid && !pairNeeded){
                        const first = this.hub.router.getPrimary();
                        if(first && first.id!==this.id && first.socket && first.online){
                            try{
                                await first.socket.sendMessage(this.notifyJid,{
                                    text:`${TAG}\n\n✅ ${this.id} (${this.self?.split('@')[0]}) ${g('is now online and ready')} 🟢`
                                });
                            }catch{}
                        }
                    }
                }
            });

            this.socket.ev.on('creds.update',saveCreds);
            this.socket.ev.on('messages.upsert', m=>this.receive(m));
        }catch(e){ console.error(`[${this.id}] init err:`,e.message); }
    }

    // ── receive & parse incoming messages ─────
    async receive({messages,type}){
        try{
            if(type!=='notify') return;
            const raw = messages[0];
            if(!raw?.message) return; // Self-bot enabled: removed fromMe block
            const mtype=Object.keys(raw.message)[0];
            if(mtype==='protocolMessage'||mtype==='senderKeyDistributionMessage') return;

            const chat    = raw.key.remoteJid;
            const isGroup = chat.endsWith('@g.us');
            const who     = raw.key.fromMe ? this.self : (isGroup ? raw.key.participant : chat);

            // only primary processes messages — others just execute dispatched cmds
            if(this.hub.router.getPrimary()?.id !== this.id) return;
            if(!this.hub.router.dedupe(raw.key.id)) return;

            // update slide tracker with fresh message from target
            for(const [,t] of this.slideLoop)
                if(t.live && t.room===chat && t.mark===who) t.ref=raw;

            // ── MUTE: auto-delete muted users' messages ───────────
            {
                const muted = this.muteList.get(chat);
                if(muted && muted.has(who)){
                    try{
                        // delete for everyone (requires bot to be admin in groups)
                        await this.socket.sendMessage(chat, { delete: raw.key });
                    }catch(e){ console.warn('[MUTE] delete failed:',e.message); }
                    return; // block further processing for muted user
                }
            }

            // ── SWIPE: auto-reply every non-command group message ──
            // FIX: quoted must be passed as 2nd arg (options), not inside msg object
            if(isGroup){
                const sw = this.swipeLoop.get(`${chat}__sw`);
                if(sw?.live){
                    const bodyTxt = raw.message.conversation||raw.message.extendedTextMessage?.text||'';
                    if(bodyTxt && !bodyTxt.startsWith('.'))
                        this.socket.sendMessage(chat,{text:sw.reply},{quoted:raw}).catch(()=>{});
                }
                // ── AREPLY: auto-reply to every message ──
                const ar = this.replyLoop.get(`${chat}__ar`);
                if(ar?.live){
                    this.socket.sendMessage(chat,{text:ar.reply},{quoted:raw}).catch(()=>{});
                }
            }

            // ── REACT: auto-react to messages from owners / subs only ──
            if(isGroup){
                const rc = this.reactLoop.get(`${chat}__rc`);
                if(rc?.live && (isOwner(who) || isSub(who,chat))){
                    this.socket.sendMessage(chat,{
                        react: { text: rc.emoji, key: raw.key }
                    }).catch(()=>{});
                }
            }

            const body = (raw.message.conversation
                        ||raw.message.extendedTextMessage?.text
                        ||raw.message.imageMessage?.caption||'').trim();
            const cmd  = body.toLowerCase();

            // only process messages that start with current prefix
            if(!body.startsWith(PREFIX) && body !== '') {
                // allow swipe to still process non-command messages (already handled above)
            }

            const isDM    = !isGroup;
            const isOwn   = isOwner(who) || raw.key.fromMe;
            const isSb    = isSub(who,chat);
            const allowed = isOwn || isSb;

            // ══ ADMIN COMMANDS ═══════════════════════════
            if(isDM && cmd===`${PREFIX}admin`){
                if(!userData.owners.length) { grantOwner(who); await this.send(chat,`${TAG}\n\n👑 ${g('you are now the owner')}\n\n${g('send')} ${PREFIX}menu ${g('to see all commands')}`); }
                else if(isOwn)              await this.send(chat,`⚠️ ${g('you already own this bot')}`);
                else                        await this.send(chat,`❌ ${g('an owner already exists')}`);
                return;
            }
            if(isDM && cmd===`${PREFIX}unadmin`){
                if(isOwn){ revokeOwner(who); await this.send(chat,`✅ ${g('owner status removed')}`); }
                else       await this.send(chat,`❌ ${g('you are not an owner')}`);
                return;
            }
            if(cmd===`${PREFIX}sub` && isOwn){
                const target = raw.message.extendedTextMessage?.contextInfo?.participant || (!isGroup ? chat : null);
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                const subChat = isGroup ? chat : target; // in DM, grant sub for their own chat
                if(grantSub(target,subChat)) await this.send(chat,`✅ ${g('promoted to sub-user')} 👥`,[target]);
                else                         await this.send(chat,`⚠️ ${g('already a sub-user')}`);
                return;
            }
            if(cmd===`${PREFIX}unsub` && isOwn){
                const target = raw.message.extendedTextMessage?.contextInfo?.participant || (!isGroup ? chat : null);
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                const subChat = isGroup ? chat : target;
                if(revokeSub(target,subChat)) await this.send(chat,`✅ ${g('sub-user removed')}`,[target]);
                return;
            }

            // ══ ADD BOT ═══════════════════════════════════
            if(isOwn && body.toLowerCase().startsWith(`${PREFIX}addbot `)){
                const num=body.slice(PREFIX.length+7).replace(/\D/g,'');
                if(num.length<10){ await this.send(chat,`❌ ${g('invalid phone number')}`); return; }
                await this.send(chat,`${TAG}\n\n⏳ ${g('creating session for')} +${num}…\n${g('pairing code will arrive in a few seconds')}`);
                const result = await this.hub.link(num,chat);
                await this.send(chat,result);
                return;
            }

            // ══ INFO COMMANDS ═════════════════════════════
            if(cmd===`${PREFIX}menu` && allowed){
                const menuTxt = MENU_TEXT();
                // Video banner → Image banner → plain text
                if(fs.existsSync(PATH_BANNER_VID)){
                    try{
                        const vidBuf = fs.readFileSync(PATH_BANNER_VID);
                        await this.socket.sendMessage(chat,{
                            video: vidBuf,
                            mimetype: 'video/mp4',
                            caption: menuTxt
                        });
                    }catch{
                        await this.send(chat, menuTxt);
                    }
                } else if(fs.existsSync(PATH_BANNER)){
                    try{
                        const imgBuf = fs.readFileSync(PATH_BANNER);
                        await this.socket.sendMessage(chat,{
                            image: imgBuf,
                            mimetype: 'image/jpeg',
                            caption: menuTxt
                        });
                    }catch{
                        await this.send(chat, menuTxt);
                    }
                } else {
                    await this.send(chat, menuTxt);
                }
                return;
            }

            // ══ TARGET MENU ═══════════════════════════════
            if(cmd===`${PREFIX}targetmenu` && allowed){
                await this.send(chat, TARGET_MENU());
                return;
            }

            // ══ DL MENU ═══════════════════════════════════
            if(cmd===`${PREFIX}dlmenu` && allowed){
                await this.send(chat, DL_MENU());
                return;
            }

            // ══ GRP MENU ═══════════════════════════════════
            if(cmd===`${PREFIX}grpmenu` && allowed){
                await this.send(chat, GRP_MENU());
                return;
            }

            // ══ GAMES MENU ════════════════════════════════
            if(cmd===`${PREFIX}games` && allowed){
                await this.send(chat, GAMES_MENU());
                return;
            }

            // ══ FLIP (coin toss) ══════════════════════════
            if(cmd===`${PREFIX}flip` && allowed){
                const result = Math.random() < 0.5;
                const emoji = result ? '👑' : '🪙';
                const side = result ? g('HEADS') : g('TAILS');
                await this.send(chat,
                    `${TAG}\n\n` +
                    `🪙 ${g('coin flip')}...\n\n` +
                    `  ${emoji}  *${side}*\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━`
                );
                return;
            }

            // ══ ROLL (dice) ═══════════════════════════════
            if((cmd===`${PREFIX}roll` || body.toLowerCase().startsWith(`${PREFIX}roll `)) && allowed){
                const max = parseInt(body.slice(PREFIX.length + 5).trim()) || 6;
                const result = Math.floor(Math.random() * max) + 1;
                const DICE_EMOJI = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                const diceE = max <= 6 ? DICE_EMOJI[result-1] : '🎲';
                await this.send(chat,
                    `${TAG}\n\n` +
                    `🎲 ${g('dice roll')} (1-${max})...\n\n` +
                    `  ${diceE}  *${result}*\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━`
                );
                return;
            }

            // ══ RPS (rock paper scissors) ═════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}rps `) && allowed){
                const input = body.slice(PREFIX.length + 4).trim().toLowerCase();
                const MAP = {r:'rock',rock:'rock',p:'paper',paper:'paper',s:'scissors',scissors:'scissors'};
                const player = MAP[input];
                if(!player){
                    await this.send(chat,`📋 ${PREFIX}rps [rock/paper/scissors]\n💡 ${g('shortcuts')}: r / p / s`);
                    return;
                }
                const choices = ['rock','paper','scissors'];
                const bot = choices[Math.floor(Math.random()*3)];
                const EMOJI_MAP = {rock:'🪨',paper:'📄',scissors:'✂️'};

                let result, emoji;
                if(player === bot){ result = g('DRAW'); emoji = '🤝'; }
                else if(
                    (player==='rock' && bot==='scissors') ||
                    (player==='paper' && bot==='rock') ||
                    (player==='scissors' && bot==='paper')
                ){ result = g('YOU WIN!'); emoji = '🏆'; }
                else { result = g('YOU LOSE!'); emoji = '💀'; }

                await this.send(chat,
                    `${TAG}\n\n` +
                    `✊ ${g('rock paper scissors')}\n\n` +
                    `  👤 ${g('you')}: ${EMOJI_MAP[player]} ${g(player)}\n` +
                    `  🤖 ${g('bot')}: ${EMOJI_MAP[bot]} ${g(bot)}\n\n` +
                    `  ${emoji}  *${result}*\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━`
                );
                return;
            }

            // ══ 8BALL (magic fortune) ═════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}8ball `) && allowed){
                const question = body.slice(PREFIX.length + 6).trim();
                if(!question){
                    await this.send(chat,`📋 ${PREFIX}8ball [${g('question')}]\n${g('example')}: ${PREFIX}8ball will i pass?`);
                    return;
                }
                const ANSWERS = [
                    '✅ ' + g('yes, definitely!'),
                    '✅ ' + g('without a doubt'),
                    '✅ ' + g('100% yes'),
                    '🟢 ' + g('most likely'),
                    '🟢 ' + g('outlook good'),
                    '🟢 ' + g('signs point to yes'),
                    '🟡 ' + g('ask again later'),
                    '🟡 ' + g('cannot predict now'),
                    '🟡 ' + g('concentrate and ask again'),
                    '🔴 ' + g('don\'t count on it'),
                    '🔴 ' + g('my sources say no'),
                    '❌ ' + g('very doubtful'),
                    '❌ ' + g('absolutely not'),
                    '💀 ' + g('bro... no.'),
                ];
                const answer = ANSWERS[Math.floor(Math.random()*ANSWERS.length)];
                await this.send(chat,
                    `${TAG}\n\n` +
                    `🔮 *${g('magic 8ball')}*\n\n` +
                    `  ❓ ${question}\n\n` +
                    `  ${answer}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━`
                );
                return;
            }

            // ══ MATH QUIZ ═══════════════════════════
            if(cmd===`${PREFIX}math` && allowed){
                const ops = ['+','-','×'];
                const op = ops[Math.floor(Math.random()*3)];
                let a, b, answer;
                if(op === '+'){
                    a = Math.floor(Math.random()*500)+1;
                    b = Math.floor(Math.random()*500)+1;
                    answer = a + b;
                } else if(op === '-'){
                    a = Math.floor(Math.random()*500)+50;
                    b = Math.floor(Math.random()*a)+1;
                    answer = a - b;
                } else {
                    a = Math.floor(Math.random()*30)+2;
                    b = Math.floor(Math.random()*30)+2;
                    answer = a * b;
                }
                // Store answer for checking
                if(!this._mathAnswer) this._mathAnswer = new Map();
                this._mathAnswer.set(chat, { answer, question: `${a} ${op} ${b}`, time: Date.now() });

                await this.send(chat,
                    `${TAG}\n\n` +
                    `➕ *${g('math quiz')}*\n\n` +
                    `  🧠  *${a} ${op} ${b} = ?*\n\n` +
                    `  📝 ${g('reply with the answer!')}\n` +
                    `  ⏰ ${g('you have 30 seconds')}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━`
                );
                // Auto-expire after 30s
                setTimeout(() => {
                    if(this._mathAnswer?.get(chat)?.time === Date.now() - 30000){
                        this._mathAnswer.delete(chat);
                    }
                }, 30000);
                return;
            }

            // ══ MATH ANSWER CHECK ═══════════════════
            if(this._mathAnswer?.has(chat) && allowed){
                const num = parseInt(body.trim());
                if(!isNaN(num)){
                    const q = this._mathAnswer.get(chat);
                    if(Date.now() - q.time > 30000){
                        this._mathAnswer.delete(chat);
                        await this.send(chat,`⏰ ${g('time up!')} ${g('answer was')}: *${q.answer}*`);
                    } else if(num === q.answer){
                        this._mathAnswer.delete(chat);
                        const ms = ((Date.now() - q.time)/1000).toFixed(1);
                        await this.send(chat,
                            `${TAG}\n\n` +
                            `✅ *${g('CORRECT!')}* 🎉\n\n` +
                            `  🧠 ${q.question} = *${q.answer}*\n` +
                            `  ⏱️ ${g('time')}: ${ms}s\n\n` +
                            `━━━━━━━━━━━━━━━━━━━━`
                        );
                    } else {
                        await this.send(chat,`❌ ${g('wrong!')} ${g('try again')}...`);
                    }
                    return;
                }
            }

            // ══ CALC (calculator) ════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}calc `) && allowed){
                const expr = body.slice(PREFIX.length + 5).trim();
                if(!expr){
                    await this.send(chat,`📋 ${PREFIX}calc [${g('expression')}]\n${g('example')}: ${PREFIX}calc 25*4+10`);
                    return;
                }
                try{
                    // Safe eval - only allow math characters
                    const safe = expr.replace(/[^0-9+\-*/.()% ]/g, '');
                    if(!safe){ await this.send(chat,`❌ ${g('invalid expression')}`); return; }
                    const result = Function('"use strict"; return (' + safe + ')')();
                    await this.send(chat,
                        `${TAG}\n\n` +
                        `🧮 *${g('calculator')}*\n\n` +
                        `  📋 ${safe}\n` +
                        `  ═══════════════\n` +
                        `  ✅ *${result}*\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━`
                    );
                }catch{
                    await this.send(chat,`❌ ${g('invalid expression')}`);
                }
                return;
            }

            if(cmd===`${PREFIX}alive` && allowed){
                const list=this.hub.router.getAll();
                let m=`${TAG}\n\n📡 ${g('linked bots')} — ${list.length}\n\n`;
                list.forEach(s=>m+=`  ${s.id}  ${s.online?'🟢':'🔴'}  ${s.self?.split('@')[0]??'—'}\n`);
                await this.send(chat,m); return;
            }
            if(cmd===`${PREFIX}ping` && allowed){
                const fakePing = [0,1,2,3,5,7,8][Math.floor(Math.random()*7)];
                await this.send(chat,`${TAG}\n\n⚡ ${fakePing}ms`);
                return;
            }
            if(cmd===`${PREFIX}words` && allowed){
                let m=`${TAG}\n\n📝 ${g('word list')}\n\n`;
                WORD_CYCLE.forEach((w,i)=>m+=`  ${i+1}. ${w}\n`);
                await this.send(chat,m); return;
            }
            if(cmd===`${PREFIX}live` && allowed){
                const all=this.hub.router.getAll();
                let nc=0,wl=0,tnc=0,sw=0,tx=0,sl=0,vc=0,im=0,ar=0,rc=0,dc=0,ax=0,ts=0,mt=0;
                all.forEach(s=>{ nc+=s.nameLoops.size; wl+=s.wordLoop.size; tnc+=s.timeLoop.size;
                    sw+=s.swipeLoop.size; ts+=s.tspamLoop.size; rc+=s.reactLoop.size;
                    tx+=s.txtLoop.size; sl+=s.slideLoop.size; vc+=s.voiceLoop.size; im+=s.imgLoop.size;
                    ar+=s.replyLoop.size; dc+=s.descLoop.size; ax+=s.alexLoop.size;
                    s.muteList.forEach(set=>mt+=set.size); });
                await this.send(chat,
                    `${TAG}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  ${g('live attacks')}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  ⚔️  ${g('name change')}  ${nc}\n`+
                    `  🌀  ${g('word cycle')}   ${wl}\n`+
                    `  ⏰  ${g('time nc')}      ${tnc}\n`+
                    `  🔁  ${g('swipe')}        ${sw}\n`+
                    `  💀  ${g('txt loop')}     ${tx}\n`+
                    `  🎯  ${g('slide')}        ${sl}\n`+
                    `  🎤  ${g('voice')}        ${vc}\n`+
                    `  📸  ${g('image')}        ${im}\n`+
                    `  💬  ${g('auto reply')}   ${ar}\n`+
                    `  📝  ${g('react')}        ${rc}\n`+
                    `  💜  ${g('desc loop')}    ${dc}\n`+
                    `  ⚡  ${g('alexswipe')}    ${ax}\n`+
                    `  😈  ${g('target spam')}  ${ts}\n`+
                    `  🔇  ${g('muted users')}  ${mt}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  🤖  ${g('bots')}  ${all.filter(s=>s.online).length}/${all.length}`
                ); return;
            }

            if(!allowed) return;

            // ══ ON / OFF (per-group bot toggle) ══════════════
            if(cmd===`${PREFIX}on`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                disabledChats.delete(chat);
                await this.send(chat,`${TAG}\n\n✅ ${g('bot activated')} 🟢\n  ${g('all commands are now active')}`);
                return;
            }
            if(cmd===`${PREFIX}off`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                disabledChats.add(chat);
                await this.send(chat,`${TAG}\n\n⛔ ${g('bot deactivated')} 🔴\n  ${g('send')} ${PREFIX}on ${g('to reactivate')}`);
                return;
            }

            // if bot is OFF in this group, block everything else
            if(isGroup && disabledChats.has(chat)) return;

            // ══ RESTART (reconnect all sessions) ══════════════
            if(cmd===`${PREFIX}restart`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                await this.send(chat,`${TAG}\n\n🔄 ${g('restarting all bots')}... ⏳`);
                await delay(1000);
                for(const s of this.hub.router.getAll()){
                    try{ s.online=false; s.socket?.end(new Error('restart')); }catch{}
                }
                return;
            }

            // ══ KILLALL ════════════════════════════════════
            if(cmd===`${PREFIX}killall`){
                await this.hub.router.push('kill_all',{chat},this.id); return;
            }

            // ══ SET PREFIX ═════════════════════════════════
            if(cmd.startsWith(`${PREFIX.toLowerCase()}setprefix `)){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const newPrefix = body.slice(`${PREFIX}setprefix `.length).trim().split(' ')[0];
                if(!newPrefix || newPrefix.length > 3){
                    await this.send(chat,`❌ ${g('prefix must be 1-3 chars')}\n📋 ${g('example')}: ${PREFIX}setprefix !`);
                    return;
                }
                const old = PREFIX;
                PREFIX = newPrefix;
                savePrefix();
                await this.send(chat,
                    `${TAG}\n\n` +
                    `✅ ${g('prefix changed!')}\n\n` +
                    `  ${g('old prefix')} → \`${old}\`\n` +
                    `  ${g('new prefix')} → \`${PREFIX}\`\n\n` +
                    `${g('example')}: ${PREFIX}menu  ${PREFIX}killall  ${PREFIX}anc1`
                );
                return;
            }

            // ══ LOCK / UNLOCK GROUP CHAT ═══════════════════════
            if(cmd===`${PREFIX}lockgc`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                try{
                    await this.socket.groupSettingUpdate(chat, 'announcement');
                    await this.send(chat,`${TAG}\n\n🔒 ${g('group locked!')}\n  ${g('only admins can send messages now')}`);
                }catch(e){
                    await this.send(chat,`❌ ${g('lock failed')}: ${e.message.slice(0,50)}`);
                }
                return;
            }
            if(cmd===`${PREFIX}unlockgc`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                try{
                    await this.socket.groupSettingUpdate(chat, 'not_announcement');
                    await this.send(chat,`${TAG}\n\n🔓 ${g('group unlocked!')}\n  ${g('everyone can send messages now')}`);
                }catch(e){
                    await this.send(chat,`❌ ${g('unlock failed')}: ${e.message.slice(0,50)}`);
                }
                return;
            }

            // ══ LEAVE GROUP ════════════════════════════════
            if(cmd===`${PREFIX}leave`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.send(chat,`${TAG}\n\n👋 ${g('leaving group')}...`);
                await delay(1000);
                const all=this.hub.router.getAll();
                for(const s of all){
                    if(s.socket && s.online){
                        try{ await s.socket.groupLeave(chat); }catch(e){ console.error(`[${s.id}] leave err:`,e.message); }
                    }
                }
                return;
            }

            // ══ PROMOTE (make group admin) ════════════════
            if((cmd===`${PREFIX}promote` || body.toLowerCase().startsWith(`${PREFIX}promote `)) && isOwn){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0];
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}promote @user`); return; }
                try{
                    await this.socket.groupParticipantsUpdate(chat, [target], 'promote');
                    await this.send(chat,
                        `${TAG}\n\n👑 ${g('promoted to admin!')}  ✅\n\n  👤 @${target.split('@')[0]}`,
                        [target]
                    );
                }catch(e){
                    await this.send(chat,`❌ ${g('promote failed')}: ${e.message}`);
                }
                return;
            }

            // ══ DEMOTE (remove group admin) ════════════════
            if((cmd===`${PREFIX}demote` || body.toLowerCase().startsWith(`${PREFIX}demote `)) && isOwn){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0];
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}demote @user`); return; }
                try{
                    await this.socket.groupParticipantsUpdate(chat, [target], 'demote');
                    await this.send(chat,
                        `${TAG}\n\n⬇️ ${g('demoted from admin!')}  ✅\n\n  👤 @${target.split('@')[0]}`,
                        [target]
                    );
                }catch(e){
                    await this.send(chat,`❌ ${g('demote failed')}: ${e.message}`);
                }
                return;
            }

            // ══ ADD (add member to group) ══════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}add `) && isOwn){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const numRaw = body.slice(PREFIX.length + 4).trim().replace(/[^0-9]/g, '');
                if(!numRaw || numRaw.length < 10){
                    await this.send(chat,`📋 ${PREFIX}add [${g('number')}]\n${g('example')}: ${PREFIX}add 919876543210\n💡 ${g('use country code without +')}`);
                    return;
                }
                const jid = numRaw + '@s.whatsapp.net';
                try{
                    const res = await this.socket.groupParticipantsUpdate(chat, [jid], 'add');
                    const status = res?.[0]?.status;
                    if(status === '200' || status === 200){
                        await this.send(chat,`${TAG}\n\n✅ ${g('added successfully!')}\n\n  👤 @${numRaw}`, [jid]);
                    } else if(status === '403'){
                        await this.send(chat,`❌ ${g('privacy settings prevent adding')}\n💡 ${g('invite link sent instead')}`);
                    } else if(status === '409'){
                        await this.send(chat,`⚠️ ${g('user already in group')}`);
                    } else {
                        await this.send(chat,`⚠️ ${g('add result')}: ${JSON.stringify(status)}`);
                    }
                }catch(e){
                    await this.send(chat,`❌ ${g('add failed')}: ${e.message}`);
                }
                return;
            }

            // ══ BLOCK / UNBLOCK ═════════════════════════════

            // ══ REMOVE (kick member from group) ═══════════
            if((cmd===`${PREFIX}remove` || body.toLowerCase().startsWith(`${PREFIX}remove `)) && isOwn){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0];
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}remove @user`); return; }
                try{
                    await this.socket.groupParticipantsUpdate(chat, [target], 'remove');
                    await this.send(chat,
                        `${TAG}\n\n🚪 ${g('removed from group!')}  ✅\n\n  👤 @${target.split('@')[0]}`,
                        [target]
                    );
                }catch(e){
                    await this.send(chat,`❌ ${g('remove failed')}: ${e.message}`);
                }
                return;
            }

            // ══ BLOCK / UNBLOCK ═════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}block `)){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const nums = body.slice(PREFIX.length + 6).trim()
                    .split(/[\s,]+/)
                    .map(n => n.replace(/[^\d]/g,''))
                    .filter(n => n.length >= 7);
                if(!nums.length){
                    await this.send(chat,`📋 ${PREFIX}block [${g('number')}]\n${g('example')}: ${PREFIX}block 919876543210`);
                    return;
                }
                const doBlock = async (n, action) => {
                    const jid = `${n}@s.whatsapp.net`;
                    try{
                        await this.socket.updateBlockStatus(jid, action);
                        return;
                    }catch{
                        // Fallback: raw IQ node; ignores server bad-request
                        await this.socket.sendNode({
                            tag:'iq',
                            attrs:{ to:'s.whatsapp.net', type:'set', xmlns:'blocklist',
                                    id: (this.socket.generateMessageTag?.() || Date.now().toString()) },
                            content:[{ tag:'item', attrs:{ action, jid } }]
                        });
                    }
                };
                const results = await Promise.allSettled(nums.map(async n => {
                    try{ await doBlock(n,'block'); return `🚫 +${n}`; }
                    catch(e){ return `❌ +${n}: ${e.message.slice(0,40)}`; }
                }));
                await this.send(chat,`${TAG}\n\n🚫 *${g('block results')}*\n${results.map(r=>r.value??r.reason).join('\n')}`);
                return;
            }
            if(body.toLowerCase().startsWith(`${PREFIX}unblock `)){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const nums = body.slice(PREFIX.length + 8).trim()
                    .split(/[\s,]+/)
                    .map(n => n.replace(/[^\d]/g,''))
                    .filter(n => n.length >= 7);
                if(!nums.length){
                    await this.send(chat,`📋 ${PREFIX}unblock [${g('number')}]\n${g('example')}: ${PREFIX}unblock 919876543210`);
                    return;
                }
                const doUnblock = async (n) => {
                    const jid = `${n}@s.whatsapp.net`;
                    try{
                        await this.socket.updateBlockStatus(jid, 'unblock');
                        return;
                    }catch{
                        await this.socket.sendNode({
                            tag:'iq',
                            attrs:{ to:'s.whatsapp.net', type:'set', xmlns:'blocklist',
                                    id: (this.socket.generateMessageTag?.() || Date.now().toString()) },
                            content:[{ tag:'item', attrs:{ action:'unblock', jid } }]
                        });
                    }
                };
                const results = await Promise.allSettled(nums.map(async n => {
                    try{ await doUnblock(n); return `✅ +${n}`; }
                    catch(e){ return `❌ +${n}: ${e.message.slice(0,40)}`; }
                }));
                await this.send(chat,`${TAG}\n\n✅ *${g('unblock results')}*\n${results.map(r=>r.value??r.reason).join('\n')}`);
                return;
            }
            // ══ BANNER / DELBANNER ══════════════════════════════

            if(cmd===`${PREFIX}banner`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const quotedMsg = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const imgMsg = quotedMsg?.imageMessage;
                const vidMsg = quotedMsg?.videoMessage;
                if(!imgMsg && !vidMsg){ await this.send(chat,`📋 ${g('reply to an image or video')}\n  ${PREFIX}banner`); return; }
                try{
                    fs.mkdirSync('./store',{recursive:true});
                    if(vidMsg){
                        const stream = await downloadMediaMessage(
                            { message:{videoMessage:vidMsg}, key:raw.key }, 'buffer', {});
                        if(fs.existsSync(PATH_BANNER)) fs.unlinkSync(PATH_BANNER);
                        fs.writeFileSync(PATH_BANNER_VID, stream);
                        await this.send(chat,`${TAG}\n\n🎥 ${g('video banner set!')}\n  ${g('send')} ${PREFIX}menu ${g('to see it')}`);
                    } else {
                        const stream = await downloadMediaMessage(
                            { message:{imageMessage:imgMsg}, key:raw.key }, 'buffer', {});
                        if(fs.existsSync(PATH_BANNER_VID)) fs.unlinkSync(PATH_BANNER_VID);
                        fs.writeFileSync(PATH_BANNER, stream);
                        await this.send(chat,`${TAG}\n\n🖼️ ${g('image banner set!')}\n  ${g('send')} ${PREFIX}menu ${g('to see it')}`);
                    }
                }catch(e){ await this.send(chat,`❌ ${g('banner save failed')}: ${e.message}`); }
                return;
            }
            if(cmd===`${PREFIX}delbanner`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const hadImg = fs.existsSync(PATH_BANNER);
                const hadVid = fs.existsSync(PATH_BANNER_VID);
                if(hadImg) fs.unlinkSync(PATH_BANNER);
                if(hadVid) fs.unlinkSync(PATH_BANNER_VID);
                if(hadImg||hadVid){ await this.send(chat,`${TAG}\n\n🗑️ ${g('banner removed')} — ${g('menu is now text only')}`); }
                else { await this.send(chat,`❌ ${g('no banner set')}`); }
                return;
            }

            // ══ SETBIO / DELBIO ═══════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}setbio `)){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                const bioText = body.slice(PREFIX.length + 7).trim();
                if(!bioText){ await this.send(chat,`📋 ${PREFIX}setbio [${g('text')}]\n${g('example')}: ${PREFIX}setbio 👑 King of bots`); return; }
                fs.writeFileSync(PATH_BIO, bioText, 'utf8');
                await this.send(chat,`${TAG}\n\n✍️ ${g('bio set!')}\n\n  ${bioText}\n\n💡 ${g('visible in')} ${PREFIX}menu`);
                return;
            }
            if(cmd===`${PREFIX}delbio`){
                if(!isOwn){ await this.send(chat,`❌ ${g('owners only')}`); return; }
                if(fs.existsSync(PATH_BIO)){
                    fs.unlinkSync(PATH_BIO);
                    await this.send(chat,`${TAG}\n\n🗑️ ${g('bio removed')}`);
                } else {
                    await this.send(chat,`❌ ${g('no bio set')}`);
                }
                return;
            }

            // ══ SPEED control ══════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}speed `)){
                const parts=body.slice(PREFIX.length+6).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${g('usage')}: ${PREFIX}speed [anc1-anc7/quad/desc] [ms]`); return; }
                const setId=parts[0].toLowerCase(), ms=parseInt(parts[1]);
                if(!SET_KEYS[setId] && !['nc', 'quad', 'desc', 'alexswipe', 'timenc'].includes(setId)){
                    await this.send(chat,`❌ ${g('use anc1 to anc7, nc, quad, desc, alexswipe or timenc')}`); return;
                }
                const minMs = setId==='alexswipe' ? 500 : 10;
                if(isNaN(ms)||ms<minMs){ await this.send(chat,`⏱️ ${g('minimum')} ${minMs}ms`); return; }
                timingMap[setId]=ms; saveTiming();
                await this.send(chat,`${TAG}\n\n⏱️ ${setId.toUpperCase()} ${g('speed set to')} ${ms}ms`);
                return;
            }

            // ══ NAME CHANGE  .anc1 – .anc7 ════════════════════
            for(const [key,setName] of Object.entries(SET_KEYS)){
                if(body.toLowerCase().startsWith(`${PREFIX}${key} `)){
                    const txt=body.slice(PREFIX.length+key.length+1).trim();
                    if(!txt){ await this.send(chat,`📋 ${PREFIX}${key} [${g('text')}]`); return; }
                    if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                    await this.hub.router.pushAll('nc_start',{chat,txt: iFnt(txt),key,setName},this.id); return;
                }
            }
            if(cmd===`${PREFIX}ancstop`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.pushAll('nc_stop',{chat},this.id); return;
            }

            // ══ .quad1–.quad4 (4 NC at once) ══════════════════
            const quadLower = body.toLowerCase();
            const quadNum = ['1','2','3','4'].find(n => quadLower.startsWith(`${PREFIX.toLowerCase()}quad${n} `));
            if(quadNum){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = body.slice(PREFIX.length + 5 + 1).trim(); // PREFIX + 'quadN' + space
                if(!txt){ await this.send(chat,`📋 ${PREFIX}quad${quadNum} [${g('text')}]`); return; }
                await this.hub.router.pushAll('quad_start',{chat,txt: iFnt(txt),qNum:quadNum},this.id); return;
            }
            if(cmd===`${PREFIX}stopquad`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.pushAll('quad_stop',{chat},this.id); return;
            }

            // ══ .nc WORD CYCLE ══════════════════════════════
            if(new RegExp(`^${PREFIX.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(nc)\\s+\\S`,'i').test(body) && !new RegExp(`^${PREFIX.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(nc[0-9])`,'i').test(body)){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=body.slice(PREFIX.length+3).trim();
                await this.hub.router.pushAll('word_start',{chat,txt: iFnt(txt)},this.id); return;
            }
            if(cmd===`${PREFIX}stopnc`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.pushAll('word_stop',{chat},this.id); return;
            }

            // ══ .timenc LIVE CLOCK NAME CHANGE ═════════════
            if(body.toLowerCase().startsWith(`${PREFIX}timenc`)){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const arg = body.slice(PREFIX.length+6).trim();
                const parts = arg.split(' ');
                const lastN = parseInt(parts[parts.length-1]);
                let ms  = (!isNaN(lastN) && lastN>=1) ? lastN : (timingMap.timenc||10);
                let txt = (!isNaN(lastN) && lastN>=1) ? parts.slice(0,-1).join(' ') : arg;
                // save chosen speed to timingMap so !speed timenc works too
                timingMap.timenc = ms; saveTiming();
                await this.hub.router.pushAll('timenc_start',{chat,txt: iFnt(txt)},this.id); return;
            }
            if(cmd===`${PREFIX}stoptimenc`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.pushAll('timenc_stop',{chat},this.id); return;
            }

            // ══ .desc DESCRIPTION CHANGE LOOP ═══════════════
            if(body.toLowerCase().startsWith(`${PREFIX}desc `)){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=body.slice(PREFIX.length+5).trim();
                if(!txt){ await this.send(chat,`📋 ${PREFIX}desc [${g('text')}]`); return; }
                await this.hub.router.pushAll('desc_start',{chat,txt},this.id); return;
            }
            if(cmd===`${PREFIX}stopdesc`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.pushAll('desc_stop',{chat},this.id); return;
            }

            // ══ .swipe ══════════════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}swipe`)){
                
                const reply=body.slice(PREFIX.length+5).trim()||'👁️';
                await this.hub.router.push('swipe_start',{chat,reply},this.id); return;
            }
            if(cmd===`${PREFIX}stopswipe`){
                
                await this.hub.router.push('swipe_stop',{chat},this.id); return;
            }

            // ══ .areply ═════════════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}areply `)){
                
                const reply=body.slice(PREFIX.length+7).trim();
                if(!reply){ await this.send(chat,`📋 ${PREFIX}areply [${g('text')}]`); return; }
                await this.hub.router.push('areply_start',{chat,reply},this.id); return;
            }
            if(cmd===`${PREFIX}stopreply`){
                
                await this.hub.router.push('areply_stop',{chat},this.id); return;
            }

            // ══ .react (auto-react to owner/sub messages) ═══════════
            if(body.toLowerCase().startsWith(`${PREFIX}react `)){
                const emoji = body.slice(PREFIX.length + 6).trim();
                if(!emoji){ await this.send(chat,`📋 ${PREFIX}react [👍 / ❤️ / 😂 ...]`); return; }
                await this.hub.router.push('react_start',{chat,emoji},this.id); return;
            }
            if(cmd===`${PREFIX}stopreact`){
                await this.hub.router.push('react_stop',{chat},this.id); return;
            }

            // ══ .txt ════════════════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}txt `)){
                const parts=body.slice(PREFIX.length+4).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${PREFIX}txt [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('txt_start',{chat,txt,ms},this.id); return;
            }
            if(cmd===`${PREFIX}stoptxt`){
                await this.hub.router.push('txt_stop',{chat},this.id); return;
            }

            // ══ .alexswipe (saved text swipe on target) ═════
            if(cmd===`${PREFIX}alexswipe` || body.toLowerCase().startsWith(`${PREFIX}alexswipe `)){
                
                // get target: reply or mention
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0] || (!isGroup ? chat : null);
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}alexswipe @user`); return; }
                const list = savedData[chat];
                if(!list || list.length===0){ await this.send(chat,`📭 ${g('no saved texts')}\n${g('use')} ${PREFIX}save [text] ${g('first')}`); return; }
                await this.hub.router.push('alex_start',{chat,target,texts:[...list]},this.id); return;
            }
            if(cmd===`${PREFIX}stopalex`){
                
                await this.hub.router.push('alex_stop',{chat},this.id); return;
            }

            // ══ .tspam (target name spam) ═══════════════════
            if(body.toLowerCase().startsWith(`${PREFIX.toLowerCase()}tspam `)){
                
                const parts = body.slice(PREFIX.length+6).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${PREFIX}tspam [${g('target name')}] [${g('ms')}]\n📋 ${g('example')}: ${PREFIX}tspam ALEX 15000`); return; }
                const ms = parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<500){ await this.send(chat,`⏱️ ${g('minimum 500ms')}`); return; }
                const targetName = parts.slice(0,-1).join(' ');
                if(!targetName){ await this.send(chat,`📋 ${PREFIX}tspam [${g('target name')}] [${g('ms')}]`); return; }
                await this.hub.router.push('tspam_start',{chat,targetName: iFnt(targetName),ms},this.id); return;
            }
            if(cmd===`${PREFIX.toLowerCase()}stoptspam`){
                
                await this.hub.router.push('tspam_stop',{chat},this.id); return;
            }

            // ══ .slide ══════════════════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}slide `)){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage){
                    await this.send(chat,`↩️ ${g('reply to target first')}\n📋 ${PREFIX}slide [${g('text')}] [${g('ms')}]`); return;
                }
                const parts=body.slice(PREFIX.length+6).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${PREFIX}slide [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                const ctx=raw.message.extendedTextMessage.contextInfo;
                await this.hub.router.push('slide_start',{
                    chat,txt,ms,
                    mark:  ctx.participant||ctx.remoteJid,
                    refId: ctx.stanzaId,
                    refMsg:ctx.quotedMessage
                },this.id); return;
            }
            if(cmd===`${PREFIX}stopslide`){
                await this.hub.router.push('slide_stop',{chat},this.id); return;
            }

            // ══ .voice (single TTS) ═════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}voice `)){
                const txt=body.slice(PREFIX.length+6).trim();
                if(!txt){ await this.send(chat,`📋 ${PREFIX}voice [${g('text')}]`); return; }
                try{
                    const {buffer,mimetype,ptt}=await makeTTS(txt);
                    await this.socket.sendMessage(chat,{audio:buffer,mimetype,ptt});
                }catch(e){ await this.send(chat,`❌ ${g('tts failed')}: ${e.message}`); }
                return;
            }

            // ══ .voiceatk (TTS loop) ════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}voiceatk `)){
                const parts=body.slice(PREFIX.length+9).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${PREFIX}voiceatk [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<1000){ await this.send(chat,`⏱️ ${g('minimum 1000ms for voice')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('voice_start',{chat,txt,ms},this.id); return;
            }
            if(cmd===`${PREFIX}stopvoice`){
                await this.hub.router.push('voice_stop',{chat},this.id); return;
            }

            // ══ .insta / .dl (download video via yt-dlp — no captcha!) ═══
            if(body.toLowerCase().startsWith(`${PREFIX}insta `) || body.toLowerCase().startsWith(`${PREFIX}dl `)){
                const isInsta = body.toLowerCase().startsWith(`${PREFIX}insta `);
                const url = body.slice(PREFIX.length + (isInsta ? 6 : 3)).trim();
                if(!url || !url.startsWith('http')){
                    await this.send(chat,
                        `📋 ${isInsta ? PREFIX+'insta' : PREFIX+'dl'} [${g('url')}]\n` +
                        `${g('supported')}:\n` +
                        `  📸 Instagram reels/posts\n` +
                        `  🎬 YouTube videos/shorts\n` +
                        `  🐦 Twitter/X videos\n` +
                        `  🎵 TikTok videos\n` +
                        `  📌 Pinterest, Reddit, etc.\n\n` +
                        `${g('example')}:\n` +
                        `  ${PREFIX}insta https://www.instagram.com/reel/ABC123\n` +
                        `  ${PREFIX}dl https://youtube.com/watch?v=xyz`
                    ); return;
                }

                await this.send(chat,`${TAG}\n\n⏳ ${g('downloading')}...\n🔗 ${url.slice(0,60)}${url.length>60?'...':''}`);

                // Use local yt-dlp.exe (no captcha, no API limits)
                const ytdlpPath = './yt-dlp.exe';
                const tmpFile = `./store/_dl_${Date.now()}`;

                try{
                    // Download video (max 50MB for WhatsApp, 720p for speed)
                    const args = [
                        '--js-runtimes', 'node',
                        '--no-playlist',
                        '--max-filesize', '50m',
                        '-S', 'vcodec:h264,res:720,acodec:m4a',
                        '-f', 'bestvideo+bestaudio/best',
                        '--merge-output-format', 'mp4',
                        '-o', tmpFile + '.%(ext)s',
                        '--no-warnings',
                        '--no-check-certificates'
                    ];
                    if(fs.existsSync('./store/cookies.txt')) {
                        args.push('--cookies', './store/cookies.txt');
                    } else {
                        args.push('--cookies-from-browser', 'edge');
                    }
                    args.push(url);

                    const result = spawnSync(ytdlpPath, args, {
                        timeout: 120000, // 2 min max
                        maxBuffer: 5 * 1024 * 1024
                    });

                    if(result.status !== 0){
                        const err = result.stderr?.toString().slice(0, 200) || 'unknown error';
                        console.warn('[DL] yt-dlp error:', err);
                        await this.send(chat,`❌ ${g('download failed')}\n💡 ${g('make sure the link is public')}\n📝 ${err.slice(0,100)}`);
                        return;
                    }

                    // Find the downloaded file
                    const storeFiles = fs.readdirSync('./store');
                    const dlFile = storeFiles.find(f => f.startsWith(`_dl_`) && f.includes(tmpFile.split('_dl_')[1]?.split('.')[0]));

                    if(!dlFile){
                        await this.send(chat,`❌ ${g('file not found after download')}`);
                        return;
                    }

                    const filePath = `./store/${dlFile}`;
                    const buf = fs.readFileSync(filePath);

                    // Check file size (WhatsApp limit ~64MB, we use 50MB safe limit)
                    if(buf.length > 50 * 1024 * 1024){
                        fs.unlinkSync(filePath);
                        await this.send(chat,`❌ ${g('video too large')} (${Math.round(buf.length/1024/1024)}MB)\n💡 ${g('max 50MB for whatsapp')}`);
                        return;
                    }

                    const isAudio = dlFile.endsWith('.mp3') || dlFile.endsWith('.m4a') || dlFile.endsWith('.ogg') || dlFile.endsWith('.opus');
                    const sizeMB = (buf.length / 1024 / 1024).toFixed(1);

                    if(isAudio){
                        await this.socket.sendMessage(chat,{
                            audio: buf,
                            mimetype: 'audio/mpeg',
                            fileName: dlFile
                        });
                    } else {
                        await this.socket.sendMessage(chat,{
                            video: buf,
                            mimetype: 'video/mp4',
                            caption: `${TAG}\n\n📥 ${g('downloaded!')}\n📦 ${sizeMB}MB\n🔗 ${url.slice(0,50)}${url.length>50?'...':''}`,
                            fileName: dlFile
                        });
                    }

                    // Cleanup temp file
                    try{ fs.unlinkSync(filePath); }catch{}

                }catch(e){
                    await this.send(chat,`❌ ${g('download error')}: ${e.message}`);
                    // Cleanup any leftover temp files
                    try{
                        const storeFiles = fs.readdirSync('./store');
                        storeFiles.filter(f => f.startsWith('_dl_')).forEach(f => {
                            try{ fs.unlinkSync(`./store/${f}`); }catch{}
                        });
                    }catch{}
                }
                return;
            }
            // ══ .play (youtube audio search & download) ═══
            if(body.toLowerCase().startsWith(`${PREFIX}play `)){
                const query = body.slice(PREFIX.length + 5).trim();
                if(!query){ await this.send(chat,`📋 ${PREFIX}play [${g('song name')}]\n${g('example')}: ${PREFIX}play Tum Hi Ho`); return; }

                await this.send(chat,`${TAG}\n\n🔍 ${g('searching YouTube')}: *${query}*...`);

                const ytdlpPath = './yt-dlp.exe';
                const tmpFile = `./store/_dl_play_${Date.now()}`;

                try{
                    const args = [
                        '--js-runtimes', 'node',
                        '--no-playlist',
                        '--max-filesize', '50m',
                        '--extract-audio',
                        '--audio-format', 'mp3',
                        '-o', tmpFile + '.%(ext)s',
                        '--no-warnings',
                        '--no-check-certificates'
                    ];
                    if(fs.existsSync('./store/cookies.txt')) {
                        args.push('--cookies', './store/cookies.txt');
                    } else {
                        args.push('--cookies-from-browser', 'edge');
                    }
                    args.push(`ytsearch1:${query}`);

                    const result = spawnSync(ytdlpPath, args, {
                        timeout: 120000, 
                        encoding: 'utf-8'
                    });

                    const storeFiles = fs.readdirSync('./store');
                    const dlFile = storeFiles.find(f => f.startsWith(`_dl_play_`) && f.includes(tmpFile.split('/').pop()));

                    if(dlFile && result.status !== null){
                        const filePath = `./store/${dlFile}`;
                        const buffer = fs.readFileSync(filePath);

                        await this.socket.sendMessage(chat, {
                            audio: buffer,
                            mimetype: 'audio/mpeg',
                            ptt: false
                        });

                        try { fs.unlinkSync(filePath); } catch {}
                    } else {
                        await this.send(chat,`❌ ${g('failed to download from YouTube')}\n${g('error')}: ${result.stderr?.slice(-100) || 'not found'}`);
                    }
                }catch(e){
                    await this.send(chat,`❌ ${g('error')}: `+e.message);
                }
                return;
            }



            if(body.toLowerCase().startsWith(`${PREFIX}song `)){
                const query = body.slice(PREFIX.length + 5).trim();
                if(!query){ await this.send(chat,`📋 ${PREFIX}song [${g('song name')}]\n${g('example')}: ${PREFIX}song Tum Hi Ho`); return; }

                await this.send(chat,`${TAG}\n\n🔍 ${g('searching')} Spotify: *${query}*...`);
                try{
                    const sRes = await fetch(`https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`);
                    const sJson = await sRes.json();
                    const song = Array.isArray(sJson) ? sJson[0] : null;
                    if(!song || !song.media_url){ await this.send(chat,`❌ ${g('song not found')}: ${query}`); return; }

                    const mediaUrl = song.media_url;
                    const songName = song.song  || query;
                    const singer   = song.singers|| '';
                    const album    = song.album  || '';
                    const dur      = song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,'0')}` : '';
                    const quality  = song['320kbps']==='true' ? '320kbps' : 'HQ';
                    const plays    = song.play_count ? Number(song.play_count).toLocaleString('en-IN') : '';
                    const year     = song.year || '';

                    const caption  =
                        `🎵 *${songName}*\n` +
                        (singer ? `🎤 ${singer}\n` : '') +
                        (album  ? `💿 ${album}\n`  : '') +
                        (year   ? `📅 ${year}\n`   : '') +
                        (dur    ? `⏱️ ${dur}\n`    : '') +
                        (plays  ? `▶️ ${plays} ${g('plays')}\n` : '') +
                        `📻 ${quality}  •  JioSaavn / Spotify\n` +
                        `🤖 Cmds: !song | !spotify | !yt | !play\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `⚡ *${g('ꪖꪶꫀ᥊ ʙᴏᴛ')}*`;

                    // 1. Send album art banner with caption FIRST
                    const imageUrl = song.image;
                    if(imageUrl){
                        try{
                            const iRes = await fetch(imageUrl);
                            if(iRes.ok){
                                const imgBuf = Buffer.from(await iRes.arrayBuffer());
                                await this.socket.sendMessage(chat,{
                                    image: imgBuf,
                                    mimetype: 'image/jpeg',
                                    caption
                                });
                            } else {
                                await this.send(chat, caption);
                            }
                        }catch{ await this.send(chat, caption); }
                    } else {
                        await this.send(chat, caption);
                    }

                    // 2. Download & send full audio
                    const aRes = await fetch(mediaUrl);
                    if(!aRes.ok){ await this.send(chat,`❌ ${g('download failed')}: ${aRes.status}`); return; }
                    const buffer = Buffer.from(await aRes.arrayBuffer());
                    await this.socket.sendMessage(chat,{
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${songName}.mp3`
                    });

                }catch(e){
                    await this.send(chat,`❌ ${g('song failed')}: ${e.message}`);
                }
                return;
            }

            // ══ .yt (search top 5 youtube videos, pick by number) ═══════════
            if(body.toLowerCase().startsWith(`${PREFIX}yt `)){
                const query = body.slice(PREFIX.length + 3).trim();
                if(!query){ await this.send(chat,`📋 ${PREFIX}yt [${g('song name')}]\n${g('example')}: ${PREFIX}yt Tum Hi Ho`); return; }

                // Check if user typed a number to pick from previous search
                const pickNum = parseInt(query);
                const cacheKey = `${chat}__yt_cache`;

                if(!isNaN(pickNum) && this._ytCache?.key === cacheKey){
                    const videos = this._ytCache.videos;
                    if(pickNum < 1 || pickNum > videos.length){
                        await this.send(chat,`❌ ${g('pick a number between')} 1-${videos.length}`); return;
                    }
                    const video = videos[pickNum - 1];
                    const url = `https://www.youtube.com/watch?v=${video.id}`;
                    const caption  =
                        `🎵 *${video.title}*\n` +
                        (video.duration ? `⏱️ ${Math.floor(video.duration/60)}:${String(video.duration%60).padStart(2,'0')}\n` : '') +
                        `📻 YouTube Audio\n` +
                        `🤖 Cmds: !song | !spotify | !yt | !play\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `⚡ *${g('ꪖꪶꫀ᥊ ʙᴏᴛ')}*`;

                    const thumbUrl = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                    try{
                        const iRes = await fetch(thumbUrl);
                        if(iRes.ok){
                            const imgBuf = Buffer.from(await iRes.arrayBuffer());
                            await this.socket.sendMessage(chat,{ image: imgBuf, mimetype:'image/jpeg', caption });
                        } else await this.send(chat, caption);
                    }catch{ await this.send(chat, caption); }
                    
                    const ytdlpPath = './yt-dlp.exe';
                    const tmpFile = `./store/_dl_yt_${Date.now()}`;

                    try{
                        const args = [
                            '--js-runtimes', 'node',
                            '--no-playlist',
                            '--max-filesize', '50m',
                            '--extract-audio',
                            '--audio-format', 'mp3',
                            '-o', tmpFile + '.%(ext)s',
                            '--no-warnings',
                            '--no-check-certificates'
                        ];
                        if(fs.existsSync('./store/cookies.txt')) { args.push('--cookies', './store/cookies.txt'); }
                        else { args.push('--cookies-from-browser', 'edge'); }
                        args.push(url);

                        const result = spawnSync(ytdlpPath, args, { timeout: 120000, encoding: 'utf-8' });
                        const storeFiles = fs.readdirSync('./store');
                        const dlFile = storeFiles.find(f => f.startsWith(`_dl_yt_`) && f.includes(tmpFile.split('/').pop()));

                        if(dlFile && result.status !== null){
                            const filePath = `./store/${dlFile}`;
                            const buffer = fs.readFileSync(filePath);
                            await this.socket.sendMessage(chat, { audio: buffer, mimetype: 'audio/mpeg', ptt: false });
                            try { fs.unlinkSync(filePath); } catch {}
                        } else {
                            await this.send(chat,`❌ ${g('failed to download from YouTube')}`);
                        }
                    }catch(e){
                        await this.send(chat,`❌ ${g('download failed')}: ${e.message}`);
                    }
                    this._ytCache = null; // clear cache
                    return;
                }

                // If not a number selection, perform the exact search
                await this.send(chat,`${TAG}\n\n🔍 ${g('searching YouTube')}: *${query}*...`);
                try{
                    const ytdlpPath = './yt-dlp.exe';
                    const args = [
                        'ytsearch5:' + query,
                        '--dump-json',
                        '--flat-playlist',
                        '--no-warnings'
                    ];
                    const result = spawnSync(ytdlpPath, args, { timeout: 30000, encoding: 'utf-8' });
                    
                    if(!result.stdout) throw new Error("No response from YouTube");

                    const videos = result.stdout.split('\n').filter(l=>l.trim()).map(line => {
                        try{ return JSON.parse(line); } catch(e){ return null; }
                    }).filter(v=>v!==null);

                    if(!videos.length){ await this.send(chat,`❌ ${g('no songs found for')}: ${query}`); return; }

                    this._ytCache = { key: cacheKey, videos };

                    let msg = `🎵 *YOUTUBE SEARCH RESULTS*\n━━━━━━━━━━━━━━━━━━━━\n`;
                    videos.forEach((v, i) => {
                        const dur = v.duration ? `${Math.floor(v.duration/60)}:${String(v.duration%60).padStart(2,'0')}` : '?';
                        msg += `*${i + 1}.* ${v.title}  [${dur}]\n`;
                    });
                    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
                    msg += `📋 ${g('reply with')}: ${PREFIX}yt [1-${videos.length}]\n`;
                    msg += `⚡ *${g('ꪖꪶꫀ᥊ ʙᴏᴛ')}*`;

                    await this.send(chat, msg);
                }catch(e){
                    await this.send(chat,`❌ ${g('error')}: ` + e.message);
                }
                return;
            }

            // ══ .spotify (search top 5 songs, pick by number) ═══════════
            if(body.toLowerCase().startsWith(`${PREFIX}spotify `)){
                const query = body.slice(PREFIX.length + 8).trim();
                if(!query){ await this.send(chat,`📋 ${PREFIX}spotify [${g('song name')}]\n${g('example')}: ${PREFIX}spotify Kesariya`); return; }

                // Check if user typed a number to pick from previous search
                const pickNum = parseInt(query);
                const cacheKey = `${chat}__spotify_cache`;

                if(!isNaN(pickNum) && this._spotifyCache?.key === cacheKey){
                    const songs = this._spotifyCache.songs;
                    if(pickNum < 1 || pickNum > songs.length){
                        await this.send(chat,`❌ ${g('pick a number between')} 1-${songs.length}`); return;
                    }
                    const song = songs[pickNum - 1];
                    await this.send(chat,`${TAG}\n\n⏳ ${g('downloading')} *${song.song}*...`);
                    try{
                        const songName = song.song;
                        const singer   = song.singers || '';
                        const album    = song.album   || '';
                        const dur      = song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,'0')}` : '';
                        const quality  = song['320kbps']==='true' ? '320kbps' : 'HQ';
                        const plays    = song.play_count ? Number(song.play_count).toLocaleString('en-IN') : '';
                        const year     = song.year || '';

                        const caption  =
                            `🎵 *${songName}*\n` +
                            (singer ? `🎤 ${singer}\n` : '') +
                            (album  ? `💿 ${album}\n`  : '') +
                            (year   ? `📅 ${year}\n`   : '') +
                            (dur    ? `⏱️ ${dur}\n`    : '') +
                            (plays  ? `▶️ ${plays} ${g('plays')}\n` : '') +
                            `📻 ${quality}  •  JioSaavn / Spotify\n` +
                            `🤖 Cmds: !song | !spotify | !yt | !play\n` +
                            `━━━━━━━━━━━━━━━━━━━━\n` +
                            `⚡ *${g('ꪖꪶꫀ᥊ ʙᴏᴛ')}*`;

                        // Banner
                        if(song.image){
                            try{
                                const iRes = await fetch(song.image);
                                if(iRes.ok){
                                    const imgBuf = Buffer.from(await iRes.arrayBuffer());
                                    await this.socket.sendMessage(chat,{ image: imgBuf, mimetype:'image/jpeg', caption });
                                } else await this.send(chat, caption);
                            }catch{ await this.send(chat, caption); }
                        } else await this.send(chat, caption);

                        // Audio
                        const aRes = await fetch(song.media_url);
                        if(aRes.ok){
                            const buffer = Buffer.from(await aRes.arrayBuffer());
                            await this.socket.sendMessage(chat,{ audio: buffer, mimetype:'audio/mpeg', fileName:`${songName}.mp3` });
                        } else await this.send(chat,`❌ ${g('download failed')}`);
                    }catch(e){ await this.send(chat,`❌ ${g('song failed')}: ${e.message}`); }
                    return;
                }

                // Normal search: show top 5
                await this.send(chat,`${TAG}\n\n🔍 ${g('searching')}: *${query}*...`);
                try{
                    const sRes = await fetch(`https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`);
                    const sJson = await sRes.json();
                    const songs = (Array.isArray(sJson) ? sJson : []).filter(s => s.media_url).slice(0, 5);
                    if(!songs.length){ await this.send(chat,`❌ ${g('no songs found for')}: ${query}`); return; }

                    // Cache results
                    this._spotifyCache = { key: cacheKey, songs };

                    let msg = `${TAG}\n\n🎵 *${g('search results')}* — "${query}"\n━━━━━━━━━━━━━━━━━━━━\n\n`;
                    songs.forEach((s, i) => {
                        const dur = s.duration ? `${Math.floor(s.duration/60)}:${String(s.duration%60).padStart(2,'0')}` : '';
                        msg += `  *${i+1}.* 🎵 ${s.song}\n`;
                        msg += `     🎤 ${s.singers || s.primary_artists || '—'}\n`;
                        msg += `     💿 ${s.album || '—'}${dur ? `  •  ⏱️ ${dur}` : ''}\n\n`;
                    });
                    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
                    msg += `📋 ${g('reply with')}: ${PREFIX}spotify [1-${songs.length}]\n`;
                    msg += `💡 ${g('or use')} ${PREFIX}song ${query} ${g('for instant download')}`;

                    await this.send(chat, msg);
                }catch(e){
                    await this.send(chat,`❌ ${g('search failed')}: ${e.message}`);
                }
                return;
            }

            // ══ .picmenu  /  .pic ═══════════════════════════════
            if(cmd===`${PREFIX}picmenu` && allowed){
                const fontList  = Object.keys(PIC_FONTS).map(k  => `  ${PIC_FONT_EMO[k]}  ${k.padEnd(10)} → ${PIC_FONTS[k]}`).join('\n');
                const colorList = Object.keys(PIC_COLORS).map(k => `  ${PIC_COLOR_EMO[k]}  ${k}`).join('\n');
                await this.send(chat,
                    `${TAG}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🎨  *PIC MENU*\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `📌 *USAGE:*\n` +
                    `  ${PREFIX}pic Hello\n` +
                    `  ${PREFIX}pic Hello impact\n` +
                    `  ${PREFIX}pic Hello arial red\n` +
                    `  ${PREFIX}pic Hello World georgia blue\n\n` +
                    `🔤 *FONTS* (2nd last word):\n` +
                    `${fontList}\n\n` +
                    `🎨 *COLORS* (last word):\n` +
                    `${colorList}\n\n` +
                    `💰 Default: *arial  black*\n` +
                    `💲 Background: always *WHITE*\n` +
                    `📰 Size: *640×640* (perfect for group PFP)━━━━━━━━━━━━━━━━━━━━━━`
                );
                return;
            }

            if(body.toLowerCase().startsWith(`${PREFIX}pic `)){
                const raw2  = body.slice(PREFIX.length + 4).trim();
                const parts = raw2.split(/\s+/);

                // parse from the END: optional color, optional font, rest = text
                let colorKey = 'black';
                let fontKey  = 'arial';
                const tmp = [...parts];

                if(tmp.length > 1 && PIC_COLORS[tmp[tmp.length-1].toLowerCase()]){
                    colorKey = tmp.pop().toLowerCase();
                }
                if(tmp.length > 1 && PIC_FONTS[tmp[tmp.length-1].toLowerCase()]){
                    fontKey = tmp.pop().toLowerCase();
                }
                const text = tmp.join(' ').trim();
                if(!text){ await this.send(chat,`📋 ${PREFIX}pic [text] [font] [color]\n📍 ${PREFIX}picmenu ${g('for list')}`); return; }

                try{
                    const imgBuf = await generatePic(text, fontKey, colorKey);
                    await this.socket.sendMessage(chat,{
                        image: imgBuf,
                        mimetype: 'image/jpeg',
                        caption:
                            `🎨 *${text}*\n` +
                            `🔤 ${PIC_FONTS[fontKey]}  •  ${PIC_COLOR_EMO[colorKey]} ${colorKey}\n` +
                            `📰 640×640`
                    });
                }catch(e){
                    await this.send(chat,`❌ ${g('pic failed')}: ${e.message}`);
                }
                return;
            }

            // ══ .changepfp (group pfp rotate) ══════════════
            if(body.toLowerCase().startsWith(`${PREFIX}changepfp`)){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage){
                    await this.send(chat,`🖼️ ${g('reply to an image first')}\n📋 ${PREFIX}changepfp [${g('ms')}]`); return;
                }
                const msPart = body.slice(PREFIX.length+9).trim();
                const ms = parseInt(msPart) || 3000;
                if(ms < 1000){ await this.send(chat,`⏱️ ${g('minimum 1000ms for pfp')}`); return; }
                const ctx = raw.message.extendedTextMessage.contextInfo;
                const qm  = {key:{remoteJid:chat,fromMe:false,id:ctx.stanzaId,participant:ctx.participant},message:ctx.quotedMessage};
                try{
                    const buf = await downloadMediaMessage(qm,'buffer',{});
                    await this.hub.router.push('pfp_start',{
                        chat, ms,
                        data: buf.toString('base64'),
                        mime: ctx.quotedMessage.imageMessage.mimetype||'image/jpeg'
                    },this.id);
                }catch(e){ await this.send(chat,`❌ ${g('could not download image')}: ${e.message}`); }
                return;
            }
            if(cmd===`${PREFIX}stoppfp`){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.push('pfp_stop',{chat},this.id); return;
            }

            // ══ .img (image spam) ═══════════════════════════
            if(body.toLowerCase().startsWith(`${PREFIX}img `)){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage){
                    await this.send(chat,`📸 ${g('reply to an image first')}\n📋 ${PREFIX}img [${g('ms')}]`); return;
                }
                const ms=parseInt(body.slice(PREFIX.length+4).trim());
                if(isNaN(ms)||ms<100){ await this.send(chat,`⏱️ ${g('minimum 100ms for images')}`); return; }
                const ctx=raw.message.extendedTextMessage.contextInfo;
                const qm={key:{remoteJid:chat,fromMe:false,id:ctx.stanzaId,participant:ctx.participant},message:ctx.quotedMessage};
                try{
                    const buf=await downloadMediaMessage(qm,'buffer',{});
                    await this.hub.router.push('img_start',{
                        chat,ms,
                        data:buf.toString('base64'),
                        mime:ctx.quotedMessage.imageMessage.mimetype||'image/jpeg'
                    },this.id);
                }catch(e){ await this.send(chat,`❌ ${g('could not download image')}`); }
                return;
            }
            if(cmd===`${PREFIX}stopimg`){
                await this.hub.router.push('img_stop',{chat},this.id); return;
            }

            // ══ .save  — save text to file ═══════════════════
            if(cmd===`${PREFIX.toLowerCase()}save` || cmd.startsWith(`${PREFIX.toLowerCase()}save `)){
                const txt = body.substring(PREFIX.length + 4).trim();
                if(!txt){ await this.send(chat,`📋 ${PREFIX}save [${g('text')}]`); return; }
                if(!savedData[chat]) savedData[chat] = [];
                savedData[chat].push(txt);
                saveSaved();
                await this.send(chat,
                    `${TAG}\n\n` +
                    `✅ ${g('text saved!')}\n\n` +
                    `💾 ${txt}\n\n` +
                    `📋 ${g('total saved')}: ${savedData[chat].length}\n` +
                    `📖 ${g('use')} ${PREFIX}saved ${g('to see all')}`
                );
                return;
            }

            // ══ .saved — show saved texts ════════════════════
            if(cmd===`${PREFIX.toLowerCase()}saved`){
                const list = savedData[chat];
                if(!list || list.length===0){
                    await this.send(chat,`${TAG}\n\n📭 ${g('no saved texts')}\n\n${g('use')} ${PREFIX}save [text] ${g('to save something')}`);
                    return;
                }
                let msg = `${TAG}\n\n📖 ${g('saved texts')} — ${list.length}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
                list.forEach((t,i) => msg += `  ${i+1}. ${t}\n`);
                msg += `\n━━━━━━━━━━━━━━━━━━━━\n💡 ${PREFIX}delsaved ${g('to clear all')}`;
                await this.send(chat, msg);
                return;
            }

            // ══ .delsaved — clear all saved texts ════════════
            if(cmd===`${PREFIX.toLowerCase()}delsaved` || cmd===`${PREFIX.toLowerCase()}delsave`){
                if(savedData[chat]) delete savedData[chat];
                saveSaved();
                await this.send(chat,`${TAG}\n\n🗑️ ${g('all saved texts deleted')}`);
                return;
            }

            // ══ .mute — auto-delete target's messages ════════════
            if(cmd===`${PREFIX}mute` || body.toLowerCase().startsWith(`${PREFIX}mute `)){
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0] || (!isGroup ? chat : null);
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}mute @user`); return; }
                if(!this.muteList.has(chat)) this.muteList.set(chat, new Set());
                this.muteList.get(chat).add(target);
                await this.send(chat,
                    `${TAG}\n\n🔇 ${g('muted')}!\n\n` +
                    `  👤 @${target.split('@')[0]}\n` +
                    `  💀 ${g('their messages will be auto-deleted')}\n` +
                    `  📵 ${PREFIX}unmute @user ${g('to unmute')}`,
                    [target]
                );
                return;
            }

            // ══ .unmute — stop deleting target's messages ════════
            if(cmd===`${PREFIX}unmute` || body.toLowerCase().startsWith(`${PREFIX}unmute `)){
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0] || (!isGroup ? chat : null);
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone or tag them')}\n📋 ${PREFIX}unmute @user`); return; }
                const ml = this.muteList.get(chat);
                if(ml) ml.delete(target);
                await this.send(chat,
                    `${TAG}\n\n🔊 ${g('unmuted')}!\n\n  👤 @${target.split('@')[0]}`,
                    [target]
                );
                return;
            }

            // ══ .stopmute — clear all mutes in this group ════════
            if(cmd===`${PREFIX}stopmute`){
                const count = this.muteList.get(chat)?.size || 0;
                this.muteList.delete(chat);
                await this.send(chat,`${TAG}\n\n🔊 ${g('all mutes cleared')} — ${count} ${g('user(s) unmuted')}`);
                return;
            }

            // ══ .mutelist — show muted users ═════════════════════
            if(cmd===`${PREFIX}mutelist`){
                const ml = this.muteList.get(chat);
                if(!ml || ml.size===0){
                    await this.send(chat,`${TAG}\n\n📭 ${g('no muted users in this group')}`);
                    return;
                }
                let msg = `${TAG}\n\n🔇 ${g('muted users')} — ${ml.size}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
                for(const u of ml) msg += `  📵 @${u.split('@')[0]}\n`;
                msg += `\n━━━━━━━━━━━━━━━━━━━━\n💡 ${PREFIX}unmute @user ${g('to unmute')}`;
                await this.send(chat, msg, [...ml]);
                return;
            }

        }catch(e){ console.error(`[${this.id}] receive err:`,e.message); }
    }

    // ── command executor — runs on ALL linked bots ─
    async handle(cmd, payload, notify=true){
        const {chat} = payload;
        try{
            switch(cmd){

            // ── .anc1–.anc7  (15 threads, 0-delay flood) ──
            case 'nc_start':{
                const {txt,key,setName}=payload;
                const emojis=SETS[setName];
                const ms=timingMap[key]||10;
                for(let t=0;t<15;t++){
                    const tid=`${chat}__nc_${key}_${t}`;
                    this.nameLoops.set(tid,true);
                    let i=t%emojis.length;
                    let backoff=0;
                    (async()=>{
                        while(this.nameLoops.get(tid)){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            const emo = emojis[i++%emojis.length];
                            this.socket.groupUpdateSubject(chat,`${emo} ${txt} ${emo}`).then(()=>{
                                backoff=0;
                            }).catch(e=>{
                                if(isRateErr(e)) backoff=Math.min(backoff+200, 2000);
                            });
                            if(backoff>0) await delay(backoff);
                            else if(ms>0) await delay(ms);
                            else await new Promise(r=>setImmediate(r));
                        }
                    })();
                }
                if(notify) await this.send(chat,win(`${key} ${g('name change')}`));
                break;
            }
            case 'nc_stop':{
                let n=0;
                for(const [k] of this.nameLoops) if(k.startsWith(chat)){this.nameLoops.delete(k);n++;}
                if(n&&notify) await this.send(chat,lose(g('name change')));
                break;
            }

            // ── .quad1–.quad4 (4 NC simultaneous) ───────────
            case 'quad_start':{
                const {txt,qNum}=payload;
                const QUAD_MAP = {
                    '1': [['anc1','faces'],['anc2','hearts'],['anc3','hands'],['anc4','flowers']],
                    '2': [['anc3','hands'],['anc4','flowers'],['anc5','sky'],['anc6','animals']],
                    '3': [['anc5','sky'],['anc6','animals'],['anc7','fruits'],['anc1','faces']],
                    '4': [['anc2','hearts'],['anc4','flowers'],['anc6','animals'],['anc7','fruits']],
                };
                const QUAD_LABELS = {
                    '1': ['🤡 faces','🎋 plants','🍕 food','🏗️ buildings'],
                    '2': ['🍕 food','🏗️ buildings','⚽ sports','🎸 music'],
                    '3': ['⚽ sports','🎸 music','🚂 vehicles','🤡 faces'],
                    '4': ['🎋 plants','🏗️ buildings','🎸 music','🚂 vehicles'],
                };
                const quadKeys = QUAD_MAP[qNum];
                const quadLabels = QUAD_LABELS[qNum];
                // stop existing quad loops for this chat
                for(const [k] of this.nameLoops){
                    if(k.startsWith(chat) && k.includes('__qd_')) this.nameLoops.delete(k);
                }
                for(const [key,setName] of quadKeys){
                    const emojis=SETS[setName];
                    for(let t=0;t<15;t++){
                        const tid=`${chat}__qd_${key}_${t}`;
                        this.nameLoops.set(tid,true);
                        let i=t%emojis.length;
                        let backoff=0;
                        (async()=>{
                            while(this.nameLoops.get(tid)){
                                if(!this.socket||!this.online){ await delay(2000); continue; }
                                const ms=timingMap.quad||10;
                                const emo = emojis[i++%emojis.length];
                                this.socket.groupUpdateSubject(chat,`${emo} ${txt} ${emo}`).then(()=>{
                                    backoff=0;
                                }).catch(e=>{
                                    if(isRateErr(e)) backoff=Math.min(backoff+200, 2000);
                                });
                                if(backoff>0) await delay(backoff);
                                else if(ms>0) await delay(ms);
                                else await new Promise(r=>setImmediate(r));
                            }
                        })();
                    }
                }
                if(notify) await this.send(chat,
                    `${TAG}\n\n` +
                    `⚡ ${g(`quad${qNum} nc activated`)}\n\n` +
                    `  ${quadLabels.map((l,i)=>`${g('slot '+(i+1))} — ${g(l)}`).join('\n  ')}\n\n` +
                    `  ⏱️ ${g('delay')}: ${timingMap.quad||30}ms\n` +
                    `  💡 ${PREFIX}speed quad [ms] ${g('to change')}`
                );
                break;
            }
            case 'quad_stop':{
                let n=0;
                for(const [k] of this.nameLoops){
                    if(k.startsWith(chat) && k.includes('__qd_')){ this.nameLoops.delete(k); n++; }
                }
                if(n&&notify) await this.send(chat,lose('quad nc'));
                break;
            }

            // ── .nc word cycle ───────────────────────────
            case 'word_start':{
                const {txt}=payload;
                // MULTI-THREAD WORD SPAM
                const ms = timingMap.nc||10;
                // clear old
                for(const [k,v] of this.wordLoop) if(k.startsWith(chat)) v.on=false;
                await delay(50);
                
                for(let t=0;t<15;t++){
                    const tid=`${chat}__wl_${t}`;
                    const loopSt={on:true, i:t};
                    this.wordLoop.set(tid, loopSt);
                    let wBackoff=0;
                    (async ()=>{
                        while(loopSt.on){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            const emo = WORD_CYCLE[loopSt.i++%WORD_CYCLE.length];
                            this.socket.groupUpdateSubject(chat,`${txt} ${emo}`)
                                .then(()=> wBackoff=0)
                                .catch(e=>{ if(isRateErr(e)) wBackoff=Math.min(wBackoff+200,2000); });
                            
                            if(wBackoff>0) await delay(wBackoff);
                            else if(ms>0) await delay(ms);
                            else await new Promise(r=>setImmediate(r));
                        }
                    })();
                }
                if(notify) await this.send(chat,win(PREFIX+'nc '+`${g('word cycle')}`));
                break;
            }            case 'word_stop':{
                for(const [k,v] of this.wordLoop) if(k.startsWith(chat)){v.on=false;this.wordLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'nc '+g('word cycle')));
                break;
            }

            // ── .timenc (live clock NC) ──────────────────────
            case 'timenc_start':{
                const {txt}=payload;
                // MULTI-THREAD TIMENC
                for(const [k,v] of this.timeLoop) if(k.startsWith(chat)) v.on=false;
                await delay(100);

                for(let t=0;t<15;t++) {
                    const tid=`${chat}__tnc_${t}`;
                    const loopSt={on:true};
                    this.timeLoop.set(tid, loopSt);
                    (async()=>{
                        let tBack=0;
                        while(loopSt.on){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            const curMs = timingMap.timenc||10;
                            const now   = new Date();
                            const time  = now.toLocaleTimeString('en-IN',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
                            const name  = txt ? `⏰ ${time} ︱ ${txt}` : `⏰ ${time}`;
                            
                            this.socket.groupUpdateSubject(chat, name)
                                .then(()=>{ tBack=0; })
                                .catch(e=>{
                                    if(isRateErr(e)) tBack=Math.min(tBack+200,2000);
                                });
                            
                            if(tBack>0) await delay(tBack);
                            else if(curMs>0) await delay(curMs);
                            else await new Promise(r=>setImmediate(r));
                        }
                    })();
                }
                if(notify) await this.send(chat,
                    `${win(PREFIX+'timenc ⏰')}\n` +
                    `  ⏱️ ${g('delay')}: ${timingMap.timenc||10}ms${txt?`\n  📝 ${g('label')}: ${txt}`:''}`  +
                    `\n  💡 ${PREFIX}speed timenc [ms] ${g('to change speed live')}`
                );
                break;
            }            case 'timenc_stop':{
                for(const [k,v] of this.timeLoop) if(k.startsWith(chat)){v.on=false;this.timeLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'timenc ⏰'));
                break;
            }


            // ── .swipe ────────────────────────────────────
            case 'swipe_start':{
                const {reply}=payload;
                this.swipeLoop.set(`${chat}__sw`,{live:true,reply});
                if(notify) await this.send(chat,`${win(PREFIX+'swipe')}  ›  ${reply}`);
                break;
            }
            case 'swipe_stop':{
                for(const [k,v] of this.swipeLoop) if(k.startsWith(chat)){v.live=false;this.swipeLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'swipe'));
                break;
            }

            // ── .areply ──────────────────────────────────
            case 'areply_start':{
                const {reply}=payload;
                this.replyLoop.set(`${chat}__ar`,{live:true,reply});
                if(notify) await this.send(chat,`${win(PREFIX+'areply')}  ›  ${reply}`);
                break;
            }
            case 'areply_stop':{
                for(const [k,v] of this.replyLoop) if(k.startsWith(chat)){v.live=false;this.replyLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'areply'));
                break;
            }

            // ── .react (auto-react to owner/sub msgs) ──────────────
            case 'react_start':{
                const {emoji}=payload;
                this.reactLoop.set(`${chat}__rc`,{live:true,emoji});
                if(notify) await this.send(chat,`${win(PREFIX+'react')}  ›  ${emoji}\n  📝 ${g('reacts to messages from owners & subs')}`);
                break;
            }
            case 'react_stop':{
                const k=`${chat}__rc`;
                if(this.reactLoop.has(k)){this.reactLoop.get(k).live=false;this.reactLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'react'));
                break;
            }

            // ── .txt ──────────────────────────────────────
            case 'txt_start':{
                const {txt,ms}=payload;
                const tid=`${chat}__tx`;
                if(this.txtLoop.has(tid)){this.txtLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.txtLoop.set(tid,t);
                (async()=>{
                    let tBack=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        try{
                            await this.socket.sendMessage(chat,{text:txt});
                            tBack=0;
                            await delay(ms);
                        }catch(e){
                            if(isRateErr(e)){ tBack=Math.min(tBack+1500,10000); await delay(tBack); }
                            else await delay(ms);
                        }
                    }
                })();
                if(notify) await this.send(chat,win(`${PREFIX}txt (${ms}ms)`));
                break;
            }
            case 'txt_stop':{
                const tid=`${chat}__tx`;
                if(this.txtLoop.has(tid)){this.txtLoop.get(tid).on=false;this.txtLoop.delete(tid);}
                if(notify) await this.send(chat,lose(PREFIX+'txt'));
                break;
            }

            // ── .slide ────────────────────────────────────
            case 'slide_start':{
                const {txt,ms,mark,refId,refMsg}=payload;
                const tid=`${chat}__${mark}`;
                if(this.slideLoop.has(tid)){this.slideLoop.get(tid).live=false;await delay(100);}
                const t={
                    live:true, room:chat, mark,
                    ref:{key:{remoteJid:chat,fromMe:false,id:refId,participant:mark},message:refMsg}
                };
                this.slideLoop.set(tid,t);
                (async()=>{
                    let slBack=0;
                    while(t.live){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        try{
                            await this.socket.sendMessage(chat,{text:txt},{quoted:t.ref});
                            slBack=0;
                            await delay(ms);
                        }catch(e){
                            if(isRateErr(e)){ slBack=Math.min(slBack+1500,10000); await delay(slBack); }
                            else await delay(ms);
                        }
                    }
                })();
                if(notify) await this.send(chat,win(`${PREFIX}slide (${ms}ms)`));
                break;
            }
            case 'slide_stop':{
                for(const [k,v] of this.slideLoop) if(v.room===chat){v.live=false;this.slideLoop.delete(k);}
                if(notify) await this.send(chat,lose(PREFIX+'slide'));
                break;
            }

            // ── .voiceatk ─────────────────────────────────
            case 'voice_start':{
                const {txt,ms}=payload;
                const tid=`${chat}__vc`;
                if(this.voiceLoop.has(tid)){this.voiceLoop.get(tid).on=false;await delay(200);}
                const t={on:true};
                this.voiceLoop.set(tid,t);
                (async()=>{
                    while(t.on){
                        try{
                            const {buffer,mimetype,ptt}=await makeTTS(txt);
                            await this.socket.sendMessage(chat,{audio:buffer,mimetype,ptt});
                            await delay(ms);
                        }catch{ await delay(ms); }
                    }
                })();
                if(notify) await this.send(chat,win(PREFIX+'voiceatk 🎤'));
                break;
            }
            case 'voice_stop':{
                const tid=`${chat}__vc`;
                if(this.voiceLoop.has(tid)){this.voiceLoop.get(tid).on=false;this.voiceLoop.delete(tid);}
                if(notify) await this.send(chat,lose(PREFIX+'voiceatk'));
                break;
            }

            // ── .img ──────────────────────────────────────
            case 'img_start':{
                const {ms,data,mime}=payload;
                const tid=`${chat}__im`;
                if(this.imgLoop.has(tid)){this.imgLoop.get(tid).on=false;await delay(100);}
                const t={on:true,buf:Buffer.from(data,'base64'),mime};
                this.imgLoop.set(tid,t);
                (async()=>{ while(t.on){ try{await this.socket.sendMessage(chat,{image:t.buf,mimetype:t.mime});await delay(ms);}catch{await delay(ms);} } })();
                if(notify) await this.send(chat,win(PREFIX+'img 📸'));
                break;
            }
            case 'img_stop':{
                const tid=`${chat}__im`;
                if(this.imgLoop.has(tid)){this.imgLoop.get(tid).on=false;this.imgLoop.delete(tid);}
                if(notify) await this.send(chat,lose(PREFIX+'img'));
                break;
            }

            // ── .changepfp ────────────────────────────────
            case 'pfp_start':{
                const {ms,data,mime}=payload;
                const tid=`${chat}__pf`;
                if(this.pfpLoop.has(tid)){this.pfpLoop.get(tid).on=false;await delay(200);}
                const t={on:true,buf:Buffer.from(data,'base64'),mime};
                this.pfpLoop.set(tid,t);
                (async()=>{
                    let pBack=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        try{
                            await this.socket.updateProfilePicture(chat, t.buf);
                            pBack=0;
                            await delay(ms);
                        }catch(e){
                            if(isRateErr(e)){ pBack=Math.min(pBack+3000,15000); await delay(pBack); }
                            else await delay(ms);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.changepfp 🖼️'));
                break;
            }
            case 'pfp_stop':{
                const tid=`${chat}__pf`;
                if(this.pfpLoop.has(tid)){this.pfpLoop.get(tid).on=false;this.pfpLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.changepfp'));
                break;
            }


            // ── .desc (description change loop, 6 threads) ──
            case 'desc_start':{
                const {txt}=payload;
                const tid=`${chat}__dc`;
                if(this.descLoop.has(tid)){this.descLoop.get(tid).on=false;await delay(50);}
                const t={on:true};
                this.descLoop.set(tid,t);
                const DESC_EMOJIS=['🔥','⚡','💀','👑','🎯','💣','🌀','🎭','🪬','🧿','💎','🗡️','🐉','☠️','🦅','🌟','🔱','🪩','💫','🎪'];
                for(let i=0;i<6;i++){
                    (async(offset)=>{
                        let idx=offset*3, dBack=0; await delay(i*20);
                        while(t.on){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            const ms=timingMap.desc||100;
                            const emo = DESC_EMOJIS[idx++%DESC_EMOJIS.length];
                            try{
                                await this.socket.groupUpdateDescription(chat,`${emo} ${txt} ${emo}`);
                                dBack=0; await delay(ms);
                            }catch(e){
                                if(isRateErr(e)){ dBack=Math.min(dBack+2000,15000); await delay(dBack); }
                                else await delay(ms);
                            }
                        }
                    })(i);
                }
                if(notify) await this.send(chat,
                    `${win('.desc '+g('description loop'))}\n` +
                    `  ⏱️ ${g('delay')}: ${timingMap.desc||100}ms\n` +
                    `  💡 ${PREFIX}speed desc [ms] ${g('to change')}`
                );
                break;
            }
            case 'desc_stop':{
                for(const [k,v] of this.descLoop) if(k.startsWith(chat)){v.on=false;this.descLoop.delete(k);}
                if(notify) await this.send(chat,lose('.desc'));
                break;
            }

            // ── .alexswipe (saved text swipe loop) ────────
            case 'alex_start':{
                const {target,texts}=payload;
                const tid=`${chat}__ax_${target}`;
                if(this.alexLoop.has(tid)){this.alexLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.alexLoop.set(tid,t);
                (async()=>{
                    let idx=0, aBack=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        const ms=timingMap.alexswipe||6000;
                        const txt=texts[idx%texts.length];
                        idx++;
                        try{
                            await this.socket.sendMessage(chat,{text:txt},{quoted:{key:{remoteJid:chat,fromMe:false,participant:target},message:{conversation:''}}});
                            aBack=0;
                            await delay(ms);
                        }catch(e){
                            if(isRateErr(e)){ aBack=Math.min(aBack+500,3000); await delay(aBack); }
                            else await delay(ms);
                        }
                    }
                })();
                if(notify) await this.send(chat,
                    `${win('.alexswipe')}\n` +
                    `  👤 ${g('target')}: @${target.split('@')[0]}\n` +
                    `  📝 ${g('saved texts')}: ${texts.length}\n` +
                    `  ⏱️ ${g('delay')}: ${timingMap.alexswipe||6000}ms\n` +
                    `  💡 ${PREFIX}speed alexswipe [ms] ${g('to change')}`,
                    [target]
                );
                break;
            }
            case 'alex_stop':{
                let n=0;
                for(const [k,v] of this.alexLoop) if(k.startsWith(chat)){v.on=false;this.alexLoop.delete(k);n++;}
                if(n&&notify) await this.send(chat,lose('.alexswipe'));
                break;
            }

            // ── .tspam (target name spam loop) ──────────────
            case 'tspam_start':{
                const {targetName,ms}=payload;
                const tid=`${chat}__ts`;
                if(this.tspamLoop.has(tid)){this.tspamLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.tspamLoop.set(tid,t);
                (async()=>{
                    let tsBack=0, emoIdx=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        const emo = TSPAM_EMOJIS[emoIdx % TSPAM_EMOJIS.length];
                        emoIdx++;
                        const spamMsg = TSPAM_BASE.replace(/{TARGET}/g, targetName).replace(/{EMOJI}/g, emo);
                        try{
                            await this.socket.sendMessage(chat,{text:spamMsg});
                            tsBack=0;
                            await delay(ms);
                        }catch(e){
                            if(isRateErr(e)){ tsBack=Math.min(tsBack+2000,15000); await delay(tsBack); }
                            else await delay(ms);
                        }
                    }
                })();
                if(notify) await this.send(chat,`${win('.tspam')}\n  👤 ${g('target')}: ${targetName}\n  ⏱️ ${g('delay')}: ${ms}ms`);
                break;
            }
            case 'tspam_stop':{
                for(const [k,v] of this.tspamLoop) if(k.startsWith(chat)){v.on=false;this.tspamLoop.delete(k);}
                if(notify) await this.send(chat,lose('.tspam'));
                break;
            }

            case 'kill_all':{
                let killed=0;
                const wipe=(map,check)=>{
                    for(const [k,v] of map){
                        if(check(k,v)){
                            // Since anc and quad name loops store bools 'true', not objects:
                            if(v === true) {
                                map.set(k, false); // Tell the while loop to stop
                            } else if(v && typeof v==='object'){
                                if('on'   in v) v.on  =false;
                                if('live' in v) v.live=false;
                            }
                            // Don't delete immediately if it's a boolean, let the loop die first
                            if(typeof v === 'object') map.delete(k); 
                            killed++;
                        }
                    }
                };
                wipe(this.nameLoops, k     => k.startsWith(chat));
                // Clean up the false values from nameLoops afterward
                for(const [k,v] of this.nameLoops) if(!v) this.nameLoops.delete(k);

                wipe(this.wordLoop,  k     => k.startsWith(chat));
                wipe(this.timeLoop,  k     => k.startsWith(chat));

                wipe(this.swipeLoop, k     => k.startsWith(chat));
                wipe(this.txtLoop,   k     => k.startsWith(chat));
                wipe(this.slideLoop, (_,v) => v.room===chat);
                wipe(this.voiceLoop, k     => k.startsWith(chat));
                wipe(this.imgLoop,   k     => k.startsWith(chat));
                wipe(this.pfpLoop,   k     => k.startsWith(chat));
                wipe(this.replyLoop, k     => k.startsWith(chat));
                wipe(this.reactLoop, k     => k.startsWith(chat));
                wipe(this.descLoop,  k     => k.startsWith(chat));
                wipe(this.alexLoop,  k     => k.startsWith(chat));
                wipe(this.tspamLoop, k     => k.startsWith(chat));
                // clear mutes too on killall
                if(this.muteList.has(chat)){ killed+=this.muteList.get(chat).size; this.muteList.delete(chat); }
                if(killed&&notify) await this.send(chat,`${TAG}\n\n🛑 ${g('all attacks killed')} (${killed})`);
                break;
            }

            }
        }catch(e){ console.error(`[${this.id}] handle err:`,e.message); }
    }

    async send(jid,text,mentions=[]){
        if(!this.socket||!this.online) return;
        let attempts=0;
        while(attempts<3){
            try{
                await this.socket.sendMessage(jid,{text,...(mentions.length?{mentions}:{})});
                return;
            }catch(e){
                attempts++;
                if(isRateErr(e)){ await delay(3000); }       // rate-limit → wait and retry
                else { console.error(`[${this.id}] send err:`,e.message); return; }
            }
        }
    }
}

// ═════════════════════════════════════════════
//  HUB  — manages all sessions
// ═════════════════════════════════════════════
class Hub {
    constructor(){
        this.sessions = new Map();
        this.router   = new Router();
        this.count    = 0;
        this.disk     = readJson(PATH_NETWORK,{count:0,list:[]});
        this.count    = this.disk.count||0;
    }

    _save(){
        writeJson(PATH_NETWORK,{
            count:this.count,
            list:[...this.sessions.entries()].map(([id,s])=>({id,phone:s.phone,online:s.online}))
        });
    }

    async boot(){
        const saved=this.disk.list||[];
        if(saved.length){
            console.log(`[ꪖꪶꫀ᥊-BOT] restoring ${saved.length} session(s)…`);
            for(const entry of saved){
                const ap=PATH_AUTH(entry.id);
                const hasFiles=fs.existsSync(ap)&&fs.readdirSync(ap).length>0;
                let phone=entry.phone;
                if(!hasFiles&&!phone){
                    phone=await question(`Enter number for ${entry.id} (e.g. 919876543210): `);
                    phone=phone.replace(/\D/g,'');
                    if(!phone||phone.length<10) continue;
                }
                const s=new Session(entry.id,phone,this,null);
                this.sessions.set(entry.id,s);
                this.router.attach(entry.id,s);
                await s.init();
                await delay(1500);
            }
            this._save();
        } else {
            const ph=await question('Enter number for first bot (or press Enter to skip): ');
            if(ph?.trim()){ const c=ph.replace(/\D/g,''); if(c.length>=10) await this.link(c,null); }
            else console.log('[ꪖꪶꫀ᥊-BOT] skipped — send .addbot in WhatsApp to add a bot\n');
        }
    }

    async link(phone,notifyJid=null){
        this.count++;
        const id=`X${this.count}`;
        const s=new Session(id,phone,this,notifyJid);
        this.sessions.set(id,s);
        this.router.attach(id,s);
        await s.init();
        this._save();
        return `${TAG}\n\n⏳ ${g('session')} ${id} ${g('created for')} +${phone}\n🔑 ${g('pairing code will arrive shortly')}\n\n${g('check the next message for the code')}`;
    }

    unlink(id){
        if(this.sessions.has(id)){ this.router.detach(id); this.sessions.delete(id); this._save(); }
    }
}

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
console.log(`
◈  ꪖꪶꫀ᥊ ʙᴏᴛ v8  ⚡

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  name change :  ${PREFIX}anc1-7  ${PREFIX}quad1-4  ${PREFIX}nc  ${PREFIX}timenc
  spam/reply  :  ${PREFIX}txt  ${PREFIX}swipe  ${PREFIX}slide  ${PREFIX}tspam
  media       :  ${PREFIX}voice  ${PREFIX}voiceatk  ${PREFIX}img  ${PREFIX}song
  group       :  ${PREFIX}lockgc  ${PREFIX}unlockgc  ${PREFIX}leave
  admin       :  ${PREFIX}admin  ${PREFIX}addbot  ${PREFIX}banner
  stop all    :  ${PREFIX}killall
  threads     :  1 thread \(Exact Speed\) ⚡
  prefix      :  ${PREFIX}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// ─────────────────────────────────────────────
//  GLOBAL ERROR GUARDS  — prevent crash on crypto/decryption errors
// ─────────────────────────────────────────────
process.on('uncaughtException', (err) => {
    const msg = err?.message || '';
    // Baileys WebSocket crypto error — safe to ignore, socket will auto-reconnect
    if(
        msg.includes('Unsupported state or unable to authenticate') ||
        msg.includes('aesDecryptGCM') ||
        msg.includes('decodeFrame') ||
        msg.includes('noise-handler')
    ){
        console.warn(`[⧈-BOT] ⚠️  Crypto decrypt error caught (WebSocket noise) — bots will auto-reconnect`);
        console.warn(`[⧈-BOT]    ${msg}`);
        return; // suppress crash, let connection.update handle reconnect
    }
    // All other uncaught errors: log but don't exit
    console.error(`[⧈-BOT] ❌  Uncaught exception:`, err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || String(reason);
    console.warn(`[⧈-BOT] ⚠️  Unhandled rejection: ${msg}`);
    // Don't exit — log only
});

const hub = new Hub();
await hub.boot();
rl.close();

console.log(`\n  ✅  ꪖꪶꫀ᥊ ʙᴏᴛ v8 — ʟɪᴠᴇ`);
console.log(`  →   ${PREFIX}admin  →  ᴅᴍ ᴍᴇ ᴛᴏ ᴄʟᴀɪᴍ ᴏᴡɴᴇʀ 🔐`);
console.log(`  →   ${PREFIX}menu   →  ꜱᴇɴᴅ ɪɴ ɢʀᴏᴜᴘ ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅꜱ ⚡`);
console.log(`  →   ${PREFIX}addbot →  ᴀᴅᴅ ᴍᴏʀᴇ ʙᴏᴛꜱ ꜰᴏʀ ꜱᴘᴇᴇᴅ 🚀\n`);


