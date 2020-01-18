class DNATest {
    /*Generate Private Key Bit*/
    public privateBit(publicBit: string) {
        let privateBit = '';
        for (let i = 0; i < publicBit.length; i++) {
            privateBit += (publicBit.charAt(i) === '0' ? '1' : '0');
        }
        return privateBit;
    }

    /*Generate Private Key*/
    public privateKey(publicKey: string, cipherText: string) {
        let privateKey: string, public8Bits: string, private8Bits: string, xOrVar: string, cipherBit: string;
        cipherBit = this.DNA2Bit(cipherText);
        public8Bits = this.publicBit(publicKey);
        xOrVar = this.optimizeKeyBit( cipherBit, public8Bits);
        private8Bits = this.privateBit(xOrVar);
        privateKey = this.bit2DNA(private8Bits);
        // System.out.println("\nPrivate Key Bit:\t"+private8Bits+"\nPublic Key Bit:\t"+public8Bits+"\n");
        return privateKey;
    }

    /*Generate Public Key Bit*/
    public publicBit(key: string) {
        let publicBit = '', binaryString;
        for (const c of key.split('')) {
            binaryString = parseInt(c, 10).toString(2);
            publicBit += (',' + ((binaryString.length === 6) ? '00' : '0') + binaryString);
        }
        publicBit = publicBit.replace(',', '');
        return publicBit;
    }

    public to8BitArray(keyBit: string) {
        // tslint:disable-next-line: prefer-const
        let asciiBits: string[] = new Array((keyBit.length / 8) + 1) ;
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

}
