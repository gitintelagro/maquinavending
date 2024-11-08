const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
});

const { createApp } = Vue;


createApp({
    name: "pantalla",
    data() {
        return {
            QRP: "https://vending.natdat.mx?type=QR&uuid=",
            ble_rx: "",
            ble_tx: "",
            CRDS:"0"

        };
    },

    methods: {

        mountdata() {
            this.generarQR(this.QRP);
        },
        generarQR(data) {
            new QRious({
                element: document.querySelector("#codigo"),
                value: data,
                size: 330,
                backgroundAlpha: 0,
                foreground: "#0d6efd",
                level: "H",
            });
        },
        async startPantalla() {

            await navigator.bluetooth
                .requestDevice({
                    filters: [
                        {
                            name: "IMV01",
                        }
                    ],
                    optionalServices: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
                })
                .then((device) => {
                    console.log("Connecting to GATT Server...");
                    return device.gatt.connect();
                })
                .then((server) => {
                    console.log("Getting Service...");
                    return server.getPrimaryService(
                        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
                    );
                })
                .then(async (service) => {
                    console.log("Getting Characteristic...");


                    let char_rx = await service.getCharacteristic(
                        "48d83db0-2aa3-4063-a280-9e46d6171a42"
                    );

                    let char_tx = await service.getCharacteristic(
                        "4f7b218e-ce24-4817-b469-7aea7b8aa89e"
                    );

                    var result = {
                        tx: char_tx,
                        rx: char_rx
                    }

                    return result;
                })
                .then(async (result) => {
                    Toast.fire({
                        icon: "success",
                        title: "Pantalla OK",
                    });

                    this.ble_rx = result.rx;
                    this.ble_tx = result.tx;

                    console.log(this.ble_tx);
                    console.log(this.ble_rx);

                    return this.ble_rx.startNotifications().then((_) => {
                        console.log("> Notifications started");
                        this.ble_rx.addEventListener(
                            "characteristicvaluechanged",
                            this.handleNotificationsPantalla
                        );
                    });

                })
                .catch((error) => {
                    console.log("Argh! " + error);
                    Toast.fire({
                        icon: "error",
                        title: error,
                    });
                });
        },
        async stopPantalla() {


            if (this.ble_rx) {
                this.ble_rx
                    .stopNotifications()
                    .then((_) => {
                        console.log("> Notifications stopped");

                        Toast.fire({
                            icon: "success",
                            title: "RFID_READER Desconectado",
                        });

                        this.name_rfid = "Desconectado";

                        this.ble_rx.removeEventListener(
                            "characteristicvaluechanged",
                            this.handleNotifications_rfid
                        );

                        this.ble_rx = "";
                        this.ble_tx = "";
                    })
                    .catch((error) => {
                        console.log("Argh! " + error);
                    });



            }
        },
        handleNotificationsPantalla(event) {
            var data = [];

            var enc = new TextDecoder("utf-8");
            let value = event.target.value;
            var string = new TextDecoder().decode(value);
            let valstr=string.split(":");
            console.log(valstr);
            if(valstr[0]=="QR"){
                let url=this.QRP+valstr[1];
                this.generarQR(url);
                this.sendData("QR:set");
            }

            if(valstr[0]=="CRDS"){
                this.CRDS=valstr[1];
            }

            if(valstr[0]=="MSGSUCCESS"){
                

                Toast.fire({
                    icon: "success",
                    title: valstr[1],
                });
            }

            if(valstr[0]=="MSGSERROR"){
                

                Toast.fire({
                    icon: "error",
                    title: valstr[1],
                });
            }
       


        },
        async sendData(dts) {
            return new Promise(async (resolve) => {

                let encoder = new TextEncoder(); 
                let data = encoder.encode(dts);    
                await this.ble_tx.writeValue(data);
                resolve("go");


            });
        },
        debitCard(debCraditos){

            let dbc="DBC:"+debCraditos
            this.sendData(dbc);
        },
        jugar(){
            let juego="JUG:1"
            this.sendData(juego);  
        },
        startCard(){
            let cmd="CARD:1"
            this.sendData(cmd);    
        }

    },
    computed: {

    },
    mounted() {
        this.mountdata();
    },
    created() { },
    components: {},
    props: [],
}).mount('#app');