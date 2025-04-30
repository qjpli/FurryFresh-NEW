import React, { Component } from 'react'
import {
    View,
    ActivityIndicator
} from 'react-native'
import WebView from 'react-native-webview'
import axios from 'axios'
import dimensions from '../../utils/sizing'

export default class Paypal extends Component {

    state = {
        accessToken: null,
        approvalUrl: null,
        paymentId: null
    }

    componentDidMount() {
        const { items = [] } = this.props;

        // 💵 Calculate total amount
        const total = items.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2);

        const dataDetail = {
            "intent": "sale",
            "payer": { "payment_method": "paypal" },
            "transactions": [{
                "amount": {
                    "total": total,
                    "currency": "USD",
                    "details": {
                        "subtotal": total,
                        "tax": "0",
                        "shipping": "0",
                        "handling_fee": "0",
                        "shipping_discount": "0",
                        "insurance": "0"
                    }
                },
                "item_list": {
                    "items": items.map(item => ({
                        name: item.name,
                        price: item.price.toFixed(2),
                        currency: "USD",
                        quantity: 1
                    }))
                },
                "description": "Service Payment"
            }],
            "redirect_urls": {
                "return_url": "https://example.com",
                "cancel_url": "https://example.com"
            }
        };

        const clientId = 'YOUR_CLIENT_ID';
        const secret = 'YOUR_SECRET';
        const basicAuth = 'Basic ' + btoa(`${clientId}:${secret}`);

        axios.post(
            'https://api.sandbox.paypal.com/v1/oauth2/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': basicAuth
                }
            }
        ).then(res => {
            const accessToken = res.data.access_token;

            axios.post(
                'https://api.sandbox.paypal.com/v1/payments/payment',
                dataDetail,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            ).then(res => {
                const { id, links } = res.data;
                const approvalUrl = links.find(data => data.rel === "approval_url");

                this.setState({
                    paymentId: id,
                    approvalUrl: approvalUrl.href,
                    accessToken: accessToken
                });
            }).catch(err => {
                console.log('Payment creation error:', err.response?.data || err.message);
                this.props.onPaymentStatus?.({
                    success: false,
                    message: "Failed to create payment.",
                    error: err.response?.data || err.message
                });
            });
        }).catch(err => {
            console.log('Token fetch error:', err.response?.data || err.message);
            this.props.onPaymentStatus?.({
                success: false,
                message: "Failed to get access token.",
                error: err.response?.data || err.message
            });
        });
    }

    _onNavigationStateChange = (webViewState) => {
        const { url } = webViewState;

        if (url.includes('https://example.com') && url.includes('PayerID')) {
            this.setState({ approvalUrl: null });

            const urlParams = new URLSearchParams(url.split('?')[1]);
            const PayerID = urlParams.get('PayerID');
            const paymentId = this.state.paymentId;

            if (!PayerID || !paymentId) {
                console.log('Missing PayerID or PaymentID');
                return;
            }

            axios.post(
                `https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
                { payer_id: PayerID },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.state.accessToken}`
                    }
                }
            ).then(response => {
                console.log('✅ Payment executed successfully:', response.data);
                this.props.onPaymentStatus?.({
                    success: true,
                    data: response.data
                });
            }).catch(err => {
                console.log('❌ Payment execution error:', err.response?.data || err.message);
                this.props.onPaymentStatus?.({
                    success: false,
                    message: "Failed to execute payment.",
                    error: err.response?.data || err.message
                });
            });
        }
    }

    render() {
        const { approvalUrl } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {
                    approvalUrl ? (
                        <WebView
                            style={{ height: dimensions.screenHeight, width: dimensions.screenWidth }}
                            source={{ uri: approvalUrl }}
                            onNavigationStateChange={this._onNavigationStateChange}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                        />
                    ) : <ActivityIndicator size="large" />
                }
            </View>
        );
    }
}
