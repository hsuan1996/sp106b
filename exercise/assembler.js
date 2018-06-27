var fs = require('fs'); // �ҪO
var temp = fs.readFileSync(process.argv.slice(2).toString(),{
    encoding: 'utf8'
});//CMD Ū��
var lines = temp.split(/\r?\n/);// ���Φr��
var clLines = []; //�M���ť�
var Dtable = { //dest = comp;jump
    "" :0b000,
    "M" :0b001,
    "D" :0b010,
    "MD" :0b011,
    "A" :0b100,
    "AM" :0b101,
    "AD" :0b110,
    "AMD" :0b111
}
var Jtable = { //jump
    "" :0b000,
    "JGT" :0b001,
    "JEQ" :0b010,
    "JGE" :0b011,
    "JLT" :0b100,
    "JNE" :0b101,
    "JLE" :0b110,
    "JMP" :0b111
}
var Ctable = { //comp
    "0" :0b0101010,
    "1" :0b0111111,
    "-1" :0b0111010,
    "D" :0b0001100,
    "A" :0b0110000,
    "M" :0b1110000,
    "!D" :0b0001101,
    "!A" :0b0110001,
    "!M" :0b1110001,
    "-D" :0b0001111,
    "-A" :0b0110011,
    "-M" :0b1110011,
    "D+1" :0b0011111,
    "A+1" :0b0110111,
    "M+1" :0b1110111,
    "D-1" :0b0001110,
    "A-1" :0b0110010,
    "M-1" :0b1110010,
    "D+A" :0b0000010,
    "D+M" :0b1000010,
    "D-A" :0b0010011,
    "D-M" :0b1010011,
    "A-D" :0b0000111,
    "M-D" :0b1000111,
    "D&A" :0b0000000,
    "D&M" :0b1000000,
    "D|A" :0b0010101,
    "D|M" :0b1010101
}
var Symtable = { //�Ÿ�  dest = dest = comp;jump
    "R0": 0,
    "R1": 1,
    "R2": 2,
    "R3": 3,
    "R4": 4,
    "R5": 5,
    "R6": 6,
    "R7": 7,
    "R8": 8,
    "R9": 9,
    "R10": 10,
    "R11": 11,
    "R12": 12,
    "R13": 13,
    "R14": 14,
    "R15": 15,
    "SP": 0,
    "LCL": 1,
    "ARG": 2,
    "THIS": 3,
    "THAT": 4,
    "KBD": 24576,
    "SCREEN": 16384
}
function clear(F) { //�M������ �ť�
    F = F.replace(/[\s]+/g, ""); //�ť�
    F = F.replace(/\/\/S*/g, ""); //����
    return F; 
}

var lineNum = 0;
for (var i = 0, len = lines.length; i < len; i++) { //Ū�}�C����
    if (clear(lines[i]) == "") continue; //���
    clear[lineNum] = clear(lines);
    lineNum++; //��Ƭ���
}

//PASS1 L���O
var num = 0;
for (var j = 0, lenL = clear.length; j < lenL; j++) {
    if (clear[j].match(/\(S*\)/g)) { //�OL���O
        Symtable[clear[j].replace(/[\(\)]/g, "")] = num; //�R��() �[�Jnum
        continue; //break
    }
    num ++
}

//PASS2 �s�X
var bit = 16;// �ܼƧǦC
var machine; // �����X
var End = new String(); //�����X�`�M
for (var k = 0, lenA = clear.length; k < lenA; k++) {
    if(clear[k].match(/\(S+\)/g)) continue; // ���� L
    if (clear[k].match(/\@\S+/g)) { //@��A���O 
        var tmp = clear[k].replace(/^\@/g, ""); //���M��@
        if (tmp.match(/^\d+$/g)) { //�Ʀr
            machine = (Array(16).join('0') + parseInt(tmp).toString(2)).slice(-16); // ��X��0
        }
        else {
            machine = Symtable[tmp]; //�d��
            if (typeof machine == 'undefined') {
                Symtable[tmp] = bit; //�d�L�s�W
                machine = (Array(16).join('0') + bit.toString(2)).slice(-16);//��X
                bit++; //�q16�}�l
            }
            else {
                machine = (Array(16).join('0') + machine.toString(2)).slice(-16);// �d���X
            }
        }
    }
    else { //C ���O
        if (!clear[k].match('=')) { //�Τ@�e�ݦ�"="
            clear[k] = '=' + clear[k]; 
        }
        if (!clear[k].match(';')) { //�Τ@��ݦ�";"
            clear[k] = clear[k] + ';';
        }
        var C = clear[k].substring(clear[k].indexOf('=') + 1, clear[k].indexOf(';')); //comp
        var D = clear[k].substring(0, clear[k].indexOf('=')); //dest
        var J = clear[k].substring(clear[k].indexOf(';') + 1, clear[k].length); //jump
        machine = '111' + (Array(7).join('0') + Ctable[C].toString(2)).slice(-7) + (Array(3).join('0') + Dtable[D].toString(2)).slice(-3) + (Array(3).join('0') + Jtable[J].toString(2)).slice(-3);//��X
    }
    End += machine + '\n'; //��X
}
fs.writeFileSync(process.argv.slice(2).toString().replace(".asm", ".hack"), End, {
    encoding: 'utf8'
});

