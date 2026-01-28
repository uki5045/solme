/**
 * Car365 API 보안 모듈
 * 한국교통안전공단 차세대 자동차관리정보시스템 연계용
 * Java 예제를 Node.js/TypeScript로 포팅
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { KISA_SEED_CBC } from 'kisa-seed';

// ASN.1 파싱을 위한 간단한 구현
function parseAsn1Sequence(buffer: Buffer): Buffer[] {
  const results: Buffer[] = [];
  let offset = 0;

  if (buffer[offset] !== 0x30) {
    throw new Error('Expected SEQUENCE');
  }
  offset++;

  // Length 파싱
  let length = buffer[offset];
  offset++;
  if (length & 0x80) {
    const numBytes = length & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) {
      length = (length << 8) | buffer[offset++];
    }
  }

  const endOffset = offset + length;

  while (offset < endOffset) {
    const tag = buffer[offset++];
    let elemLength = buffer[offset++];
    if (elemLength & 0x80) {
      const numBytes = elemLength & 0x7f;
      elemLength = 0;
      for (let i = 0; i < numBytes; i++) {
        elemLength = (elemLength << 8) | buffer[offset++];
      }
    }
    results.push(buffer.subarray(offset, offset + elemLength));
    offset += elemLength;
  }

  return results;
}

// ASN.1 OCTET STRING 파싱
function parseOctetString(buffer: Buffer): Buffer {
  if (buffer[0] !== 0x04) {
    throw new Error('Expected OCTET STRING');
  }
  let offset = 1;
  let length = buffer[offset++];
  if (length & 0x80) {
    const numBytes = length & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) {
      length = (length << 8) | buffer[offset++];
    }
  }
  return buffer.subarray(offset, offset + length);
}

// ASN.1 INTEGER 파싱
function parseInteger(buffer: Buffer): number {
  if (buffer[0] !== 0x02) {
    throw new Error('Expected INTEGER');
  }
  let offset = 1;
  let length = buffer[offset++];
  let value = 0;
  for (let i = 0; i < length; i++) {
    value = (value << 8) | buffer[offset++];
  }
  return value;
}

// ASN.1 DER 인코딩
function derEncodeLength(length: number): Buffer {
  if (length < 128) {
    return Buffer.from([length]);
  }
  const bytes: number[] = [];
  let temp = length;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp >>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

function derEncodeOctetString(data: Buffer): Buffer {
  const lengthBytes = derEncodeLength(data.length);
  return Buffer.concat([Buffer.from([0x04]), lengthBytes, data]);
}

function derEncodeSequence(items: Buffer[]): Buffer {
  const content = Buffer.concat(items);
  const lengthBytes = derEncodeLength(content.length);
  return Buffer.concat([Buffer.from([0x30]), lengthBytes, content]);
}

export class Car365Security {
  private publicKeyPath: string;
  private privateKeyPath: string;
  private privateKeyPassword: string;

  constructor(
    publicKeyPath: string,
    privateKeyPath: string,
    privateKeyPassword: string
  ) {
    this.publicKeyPath = publicKeyPath;
    this.privateKeyPath = privateKeyPath;
    this.privateKeyPassword = privateKeyPassword;
  }

  /**
   * 공개키 로드 (X.509 인증서에서 추출)
   */
  private readPublicKey(): crypto.KeyObject {
    const certBuffer = fs.readFileSync(this.publicKeyPath);
    const certPem = `-----BEGIN CERTIFICATE-----\n${certBuffer.toString('base64').match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
    const cert = new crypto.X509Certificate(certPem);
    return cert.publicKey;
  }

  /**
   * 개인키 로드 및 복호화
   * PKCS#5 PBE-SHA1-SEED-CBC 암호화된 키를 복호화
   */
  private readPrivateKey(): crypto.KeyObject {
    const keyBuffer = fs.readFileSync(this.privateKeyPath);
    let offset = 0;

    // 최상위 SEQUENCE
    if (keyBuffer[offset] !== 0x30) throw new Error('Expected SEQUENCE');
    offset++;
    let totalLen = keyBuffer[offset++];
    if (totalLen & 0x80) {
      const numBytes = totalLen & 0x7f;
      totalLen = 0;
      for (let i = 0; i < numBytes; i++) {
        totalLen = (totalLen << 8) | keyBuffer[offset++];
      }
    }

    // AlgorithmIdentifier SEQUENCE
    if (keyBuffer[offset] !== 0x30) throw new Error('Expected AlgorithmIdentifier SEQUENCE');
    offset++;
    let algoLen = keyBuffer[offset++];
    if (algoLen & 0x80) {
      const numBytes = algoLen & 0x7f;
      algoLen = 0;
      for (let i = 0; i < numBytes; i++) {
        algoLen = (algoLen << 8) | keyBuffer[offset++];
      }
    }
    const algoStart = offset;

    // OID 건너뛰기
    if (keyBuffer[offset] !== 0x06) throw new Error('Expected OID');
    offset++;
    const oidLen = keyBuffer[offset++];
    offset += oidLen;

    // Parameters SEQUENCE (salt, iteration)
    if (keyBuffer[offset] !== 0x30) throw new Error('Expected Parameters SEQUENCE');
    offset++;
    let paramLen = keyBuffer[offset++];
    if (paramLen & 0x80) {
      const numBytes = paramLen & 0x7f;
      paramLen = 0;
      for (let i = 0; i < numBytes; i++) {
        paramLen = (paramLen << 8) | keyBuffer[offset++];
      }
    }

    // Salt (OCTET STRING)
    if (keyBuffer[offset] !== 0x04) throw new Error('Expected Salt OCTET STRING');
    offset++;
    const saltLen = keyBuffer[offset++];
    const salt = keyBuffer.subarray(offset, offset + saltLen);
    offset += saltLen;

    // Iteration Count (INTEGER)
    if (keyBuffer[offset] !== 0x02) throw new Error('Expected Iteration INTEGER');
    offset++;
    const iterLen = keyBuffer[offset++];
    let iterations = 0;
    for (let i = 0; i < iterLen; i++) {
      iterations = (iterations << 8) | keyBuffer[offset++];
    }

    // AlgorithmIdentifier 끝으로 이동
    offset = algoStart + algoLen;

    // EncryptedData (OCTET STRING)
    if (keyBuffer[offset] !== 0x04) throw new Error('Expected EncryptedData OCTET STRING');
    offset++;
    let encDataLen = keyBuffer[offset++];
    if (encDataLen & 0x80) {
      const numBytes = encDataLen & 0x7f;
      encDataLen = 0;
      for (let i = 0; i < numBytes; i++) {
        encDataLen = (encDataLen << 8) | keyBuffer[offset++];
      }
    }
    const encryptedData = keyBuffer.subarray(offset, offset + encDataLen);

    // PKCS5 S1 키 유도 (SHA-1 기반)
    const password = Buffer.from(this.privateKeyPassword, 'utf8');
    let derivedKey = Buffer.concat([password, salt]);

    for (let i = 0; i < iterations; i++) {
      derivedKey = crypto.createHash('sha1').update(derivedKey).digest();
    }

    // 20바이트 중 앞 16바이트는 키, 뒤 4바이트로 IV 생성
    const keyData = derivedKey.subarray(0, 16);
    const digestBytes = derivedKey.subarray(16, 20);

    // IV 생성: SHA-1(digestBytes)의 앞 16바이트
    const ivHash = crypto.createHash('sha1').update(digestBytes).digest();
    const iv = ivHash.subarray(0, 16);

    // SEED/CBC로 개인키 복호화
    const decryptedKey = this.seedDecrypt(keyData, iv, encryptedData);

    // PKCS#8 개인키로 변환
    const pkcs8Pem = `-----BEGIN PRIVATE KEY-----\n${decryptedKey.toString('base64').match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

    return crypto.createPrivateKey(pkcs8Pem);
  }

  /**
   * SEED/CBC 암호화
   */
  private seedEncrypt(key: Buffer, iv: Buffer, plaintext: Buffer): Buffer {
    const keyArray = new Uint8Array(key);
    const ivArray = new Uint8Array(iv);
    const messageArray = new Uint8Array(plaintext);

    const encrypted = KISA_SEED_CBC.SEED_CBC_Encrypt(
      keyArray,
      ivArray,
      messageArray,
      0,
      messageArray.length
    );

    return Buffer.from(encrypted);
  }

  /**
   * SEED/CBC 복호화
   */
  private seedDecrypt(key: Buffer, iv: Buffer, ciphertext: Buffer): Buffer {
    const keyArray = new Uint8Array(key);
    const ivArray = new Uint8Array(iv);
    const messageArray = new Uint8Array(ciphertext);

    const decrypted = KISA_SEED_CBC.SEED_CBC_Decrypt(
      keyArray,
      ivArray,
      messageArray,
      0,
      messageArray.length
    );

    return Buffer.from(decrypted);
  }

  /**
   * RSA 공개키 암호화
   */
  private encryptByPublicKey(publicKey: crypto.KeyObject, data: Buffer): Buffer {
    return crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      data
    );
  }

  /**
   * RSA 개인키 복호화
   */
  private decryptByPrivateKey(privateKey: crypto.KeyObject, data: Buffer): Buffer {
    return crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      data
    );
  }

  /**
   * 전자서명 (SHA256withRSA)
   */
  private sign(privateKey: crypto.KeyObject, data: Buffer): Buffer {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey);
  }

  /**
   * 전자서명 검증
   */
  private verify(publicKey: crypto.KeyObject, data: Buffer, signature: Buffer): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature);
  }

  /**
   * 데이터 패키징 (ASN.1 SEQUENCE)
   */
  private dataPacking(
    encryptedKey: Buffer,
    encryptedIv: Buffer,
    signedData: Buffer,
    encryptedData: Buffer
  ): Buffer {
    return derEncodeSequence([
      derEncodeOctetString(encryptedKey),
      derEncodeOctetString(encryptedIv),
      derEncodeOctetString(signedData),
      derEncodeOctetString(encryptedData),
    ]);
  }

  /**
   * 데이터 언패킹
   */
  private dataUnpacking(packagedData: Buffer): Buffer[] {
    const items = parseAsn1Sequence(packagedData);
    return items.map((item) => {
      if (item[0] === 0x04) {
        return parseOctetString(item);
      }
      return item;
    });
  }

  /**
   * 요청 데이터 암호화
   */
  async encrypt(requestData: string): Promise<string> {
    const publicKey = this.readPublicKey();
    const privateKey = this.readPrivateKey();

    // SEED 키 생성 (16바이트)
    const key = crypto.randomBytes(16);
    // IV 생성 (16바이트)
    const iv = crypto.randomBytes(16);

    // 메시지 암호화
    const encryptedMessage = this.seedEncrypt(key, iv, Buffer.from(requestData, 'utf8'));

    // 전자서명
    const signedData = this.sign(privateKey, encryptedMessage);

    // 키와 IV를 공개키로 암호화
    const encryptedKey = this.encryptByPublicKey(publicKey, key);
    const encryptedIv = this.encryptByPublicKey(publicKey, iv);

    // 패키징 후 Base64 인코딩
    const packagedData = this.dataPacking(encryptedKey, encryptedIv, signedData, encryptedMessage);
    return packagedData.toString('base64');
  }

  /**
   * 응답 데이터 복호화
   */
  async decrypt(encryptedData: string): Promise<string> {
    const publicKey = this.readPublicKey();
    const privateKey = this.readPrivateKey();

    // Base64 디코딩 후 언패킹
    const packagedData = Buffer.from(encryptedData, 'base64');
    const [encryptedKey, encryptedIv, signedData, encryptedMessage] = this.dataUnpacking(packagedData);

    // 서명 검증
    const isValid = this.verify(publicKey, encryptedMessage, signedData);
    if (!isValid) {
      throw new Error('전자서명 검증에 실패하였습니다.');
    }

    // 키와 IV 복호화
    const key = this.decryptByPrivateKey(privateKey, encryptedKey);
    const iv = this.decryptByPrivateKey(privateKey, encryptedIv);

    // 메시지 복호화
    const decryptedMessage = this.seedDecrypt(key, iv, encryptedMessage);
    return decryptedMessage.toString('utf8');
  }
}

// 싱글톤 인스턴스
let securityInstance: Car365Security | null = null;

export function getCar365Security(): Car365Security {
  if (!securityInstance) {
    const certsPath = path.join(process.cwd(), 'certs');
    securityInstance = new Car365Security(
      path.join(certsPath, 'signCert_kotsa.der'),
      path.join(certsPath, 'signPri.key'),
      process.env.CAR365_CERT_PASSWORD || ''
    );
  }
  return securityInstance;
}
