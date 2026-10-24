'use strict';

// Pixel sprites for the `pixel` hero decoration. One character per pixel; `.` is empty.
// k ink, s skin, h head shine, o ear, y suit, r gloves/boots, w cape, g cape edge, b belt,
// m enemy, f feet, e eye, q block, u used block, c coin, l cloud, d cloud edge
module.exports = {
  hero: [
    '.....kkkkkk.........', '...kkhhsssskk.......', '..khhsssssssk.......', '..khssssssssk.......',
    '.kossskkkskkk.......', '.kosssskssksk.......', '..kssssssssk........', '..ksssskkssk........',
    '...kksssskk.........', '.ggggkkkkggg........', 'gwwwwwkyywwwg.......', 'gwwkyyyyyyywk.......',
    'gwkyyyyyyyykrrk.....', 'gwkyyyyyyykrrrrk....', 'gwkyyyyyyykrrrrk....', 'gwkbbbbbbbkkrrk.....',
    '.gkyyyyyyyk.........', '.gkyyyk.kyyk........', '..kyyk...kyk........', '..kyyk...kyk........',
    '..krrk...krrk.......', '.krrrk...krrrk......', '.kkkkk...kkkkk......'
  ],
  enemy: [
    '...kkkk...', '..kmmmmk..', '.kmmmmmmk.', 'kmekmmekmk', 'kmmmmmmmmk',
    '.kkmmmmkk.', '..kffffk..', '.kff..ffk.', 'kkk....kkk'
  ],
  block: [
    'kkkkkkkkkk', 'kqqqqqqqqk', 'kqqkkkqqqk', 'kqkqqqkqqk', 'kqqqqqkqqk',
    'kqqqkkqqqk', 'kqqqkqqqqk', 'kqqqqqqqqk', 'kqqqkqqqqk', 'kkkkkkkkkk'
  ],
  used: [
    'kkkkkkkkkk', 'kuuuuuuuuk', 'kukuuuukuk', 'kuuuuuuuuk', 'kuuuuuuuuk',
    'kuuuuuuuuk', 'kuuuuuuuuk', 'kukuuuukuk', 'kuuuuuuuuk', 'kkkkkkkkkk'
  ],
  coin: ['.cccc.', 'cccccc', 'ccckcc', 'ccckcc', 'ccckcc', 'ccckcc', 'cccccc', '.cccc.'],
  cloud: [
    '.....dddd.......', '...ddllllddd....', '..dlllllllllddd.', '.dllllllllllllld',
    'dlllllllllllllld', '.dddddddddddddd.'
  ]
};
