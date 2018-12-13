module.exports = function(RED) {
    function NatsStreamingSubNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var uuid = require('uuid/v1');

        var servers = ['nats://'+config.host+':'+config.port];

        var stan = require('node-nats-streaming').connect(config.clusterId, uuid(), { 'servers': servers, 'user': config.user, 'pass': config.password, 'encoding': 'binary', 'verbose': true })

        stan.on('connect', function() {

            let opts = stan.subscriptionOptions();
            opts.setDeliverAllAvailable();
            opts.setDurableName(config.durableName);

            console.log("connection ready")

            var durableSub = stan.subscribe(config.topic, opts);
            durableSub.on('message', function(msg) {
                console.log("message ready");
                node.send(msg.getData());
            });

            this.on('close', function() {
                if(stan) {
                    durableSub.close();
                    stan.close();
                }
            });
        });

        stan.on('error', function(err) {
            node.warn(err)
        });
    
    }
    
    RED.nodes.registerType("nats-streaming-sub", NatsStreamingSubNode);
}