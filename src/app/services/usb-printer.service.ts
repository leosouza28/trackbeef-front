import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UsbPrinterService {
    private port!: any;
    private writer!: WritableStreamDefaultWriter<Uint8Array>;

    /** solicita permissão e abre a porta serial */
    async connect(): Promise<void> {
        // filtra por dispositivos CDC-ACM (pode ajustar vendor/product se souber)
        this.port = await (navigator as any).serial.requestPort({
            filters: []
            // filters: [ 
            //     {
            //         usbVendorId: 0x28e9, // vendor id
            //         usbProductId: 0x0289 // product id
            //     }
            // ]
        });
        await this.port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: 'none' });
        this.writer = this.port.writable!.getWriter();
    }

    async connectAndPrintDebug(cmds: Uint8Array) {
        console.log('> solicitando porta…');
        const port = await (navigator as any).serial.requestPort({ filters: [] });
        console.log('> porta escolhida:', port.getInfo());

        console.log('> abrindo porta…');
        await port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: 'none' });
        console.log('> porta aberta:', port.readable, port.writable);

        const writer = port.writable!.getWriter();
        console.log('> escrevendo dados…', cmds);
        await writer.write(cmds);
        console.log('> dados escritos.');

        await writer.close();
        console.log('> writer fechado.');

        await port.close();
        console.log('> porta fechada.');
    }


    /** envia um Uint8Array com comandos ESC/POS */
    async print(data: Uint8Array) {
        if (!this.writer) throw new Error('Porta não conectada');
        await this.writer.write(data);
    }

    /** fecha a conexão */
    async disconnect() {
        await this.writer?.close();
        await this.port?.close();
    }
}