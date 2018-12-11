module.exports = function(RED) {
    function NatsStreamingSubNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var servers = ['nats://ws003176:4242'];

        var stan = require('node-nats-streaming').connect('nats_cluster', 'clientId', { 'servers': servers, 'user': admin, 'pass': 'admin', 'encoding': 'binary', 'verbose': true })

        stan.on('connect', function() {

            let opts = stan.subscriptionOptions();
            opts.setDeliverAllAvailable();
            opts.setDurableName('durable1');

            var durableSub = stan.subscribe('foo', opts);
            durableSub.on('message', function(msg) {
                node.send(msg);
            });

            this.on('close', function() {
                if(stan) {
                    durableSub.close();
                    stan.close();
                }
            });


        });
    
    }
    
    RED.nodes.registerType("nats-streaming-sub", NatsStreamingSubNode);
}