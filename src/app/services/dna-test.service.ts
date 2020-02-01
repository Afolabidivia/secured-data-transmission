import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DnaTestService {

  constructor() { }

  /*Encryption Method*/
  public encript(plaintext: string, key: string) {
    let cipherBit: string, asciiKey: string, plaindna: string, xOrVar: string, plainBit: string, cipherdna: string;
    if (!(plaintext.trim()) || !(key.trim())) {
      cipherdna = plaintext;
    } else {
      asciiKey = this.publicBit(key);
      plainBit = this.publicBit(plaintext);
      plaindna = this.bit2DNA(plainBit);
      xOrVar = this.optimizeKeyBit( plainBit, asciiKey);
      cipherBit = this.xOR(plainBit, xOrVar);
      cipherdna = this.bit2DNA(cipherBit);
    }
    return cipherdna;
  }

  public decryption(ciphertext: string , key: string, isprivateKey: boolean) {
    let plaintext: string, cipherBit: string, returnBit: string, returndna: string, xNorVar: string, asciiKey: string;
    if (!(ciphertext.trim()) || !(key.trim())) {
        plaintext = ciphertext;
    } else {
        if (!isprivateKey) {
            key = this.privateKey(key);
        }

        asciiKey = this.DNA2Bit(key);
        cipherBit = this.DNA2Bit(ciphertext);
        xNorVar = this.optimizeKeyBit(cipherBit, asciiKey);
        returnBit = this.xnOR( cipherBit, xNorVar);
        returndna = this.bit2DNA(returnBit);
        plaintext = this.bit2CharString(returnBit);
    }
    return plaintext;
  }

  /*Generate Private Key Bit*/
  public privateBit(publicBit: string) {
    let privateBit = '';
    for (let i = 0; i < publicBit.length; i++) {
        privateBit += (publicBit.charAt(i) === '0' ? '1' : '0');
    }
    return privateBit;
  }

  /*Generate Private Key*/
  public privateKey(key: string) {
    let privateKey = '';
    let publicBit: string;
    let privateBit: string;

    publicBit = this.publicBit(key);
    privateBit = this.privateBit(publicBit);
    privateKey = this.bit2DNA(privateBit);

    return privateKey;
  }

  /*Generate Public Key Bit*/
  public publicBit(key: string) {
    let publicBit = '', binaryString;
    const keyArr = key.split('');

    for (const c of keyArr) {
      binaryString = (c.charCodeAt(0)).toString(2);
      publicBit += (binaryString.length === 6 ? '00' : '0') + binaryString;
    }

    return publicBit;
  }

  public to8BitArray(keyBit: string) {
    // tslint:disable-next-line: prefer-const
    const arrLen = (keyBit.length / 8) + 1;

    // tslint:disable-next-line: prefer-const
    let asciiBits: string[] = new Array() ;
    let idx = -1;
    for (let i = 0; i < keyBit.length; i++) {
        if ((i % 8) === 0 || i === 0) {
            idx++;
            asciiBits[idx] = '';
        }
        asciiBits[idx] += keyBit.charAt(i);
    }

    return asciiBits;
  }

  /*Optimize Key Bit to Match PlainBit Length By Expansion or Contraction*/
  public optimizeKeyBit(plainBit: string, keyBit: string) {
    let newKeyBit = keyBit;
    const plainLmt = this.to8BitArray(plainBit).length;
    const keyLmt = this.to8BitArray(keyBit).length;
    const noTime = Math.round((plainLmt / keyLmt));
    const remainder = (plainLmt % keyLmt);

    for (let i = 1; i < (noTime); i++) {
        newKeyBit += keyBit;
    }

    const reml = plainBit.length - newKeyBit.length;
    if (reml > 0) {
        newKeyBit += (newKeyBit.substring(0, reml));
    }

    return newKeyBit;
  }

  /*Convert DNA cryptographic string to binary string*/
  private DNA2Bit(dna: string) {
    let bits = '';

    if (!dna) {
        dna = bits;
    } else {
        for (let i = 0; i < dna.length; i++) {
            bits += (dna.charAt(i) === 'A' ? '00' : (dna.charAt(i) === 'T'
            ? '01' : (dna.charAt(i) === 'G' ? '10' : '11')));
        }
    }

    return bits;
  }

  /*Convert bit string to DNA cryptographic string*/
  private bit2DNA(bits: string) {
    let dna = '';

    if (!bits) {
        dna = bits;
    } else {
        for (let i = 0; i < bits.length; i += 2) {
            const pair = bits.substring(i, (i + 2));
            dna += (pair === '00' ? 'A' : pair === '01'
                ? 'T' : pair === '10' ? 'G' : 'C');
        }
    }

    return dna;
  }

  /*Convert eight bit strings to seven bit ascii array*/
  public eight2ASCIIArray(eightBitString: string): string[] {
    // let asciiBits[]=new String[(eightBitString.length()/8)+1];
    let idx = -1;
    // tslint:disable-next-line: prefer-const
    const arrLen = (eightBitString.length / 8) + 1;

    // tslint:disable-next-line: prefer-const
    let asciiBits: string[] = new Array() ;

    for (let i = 0; i < eightBitString.length; i++) {
        if ((i % 8) === 0 || i === 0) {
            idx++;
            asciiBits[idx] = '';
            continue;
        }
        asciiBits[idx] += eightBitString.charAt(i);
    }
    return asciiBits;
}

  /*Encrypt or Decrypt with public key using XOR*/
  private xOR(first: string, next: string) {
    let xor = '';
    if (first && first.length <= next.length) {
      for (let i = 0; i < first.length; i++) {
        xor += (first.charAt(i) === next.charAt(i) ? '0' : '1' );
      }
    }
    return xor;
  }

  /*Encrypt or Decrypt with private key using XNOR*/
  private xnOR(first: string, next: string) {
    let xor = '';
    if (first && first.length <= next.length) {
      for (let i = 0; i < first.length; i++) {
        xor += (first.charAt(i) === next.charAt(i) ? '1' : '0' );
      }
    }
    return xor;
  }

  /*Convert bit to Character String 8bits*/
  public bit2CharString(eightBitString: string) {
    let charString = '', asciiBits: string[];
    asciiBits = this.eight2ASCIIArray(eightBitString);

    for (const asciiBit of asciiBits) {
      if (asciiBit) {
        charString += String.fromCharCode(this.bin2Dec(asciiBit));
      }
    }
    return charString;
  }

  public bin2Dec(binvals: string) {
    let dec = 0.0;
    if (binvals.trim()) {
      const ind = binvals.length;
      for (let i = 0; i < binvals.length; i++) {
        const val = (parseInt(binvals.charAt(ind - (i + 1)) + '', 10) * (Math.pow(2, i)));
        dec += val;
      }
    }

    return dec;
}

}
