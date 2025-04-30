import React, { Component } from 'react'
import {
    View,
    ActivityIndicator
} from 'react-native'
import WebView from 'react-native-webview'
import axios from 'axios'
import dimensions from '../../utils/sizing'
import { router, useLocalSearchParams, useRouter } from 'expo-router'; // Or 'expo-router' if you're using Expo Router
import { useEffect, useState } from 'react';

class Paypal extends Component {
    handled = false;

    state = {
        accessToken: null,
        approvalUrl: null,
        paymentId: null
    }

    componentDidMount() {
        const { items = [], discount = 0 } = this.props;

        // 💵 Calculate subtotal and total after discount
        const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
        const discountAmount = Number(discount);
        const total = (subtotal - discountAmount).toFixed(2);

        console.log('Items: ', items);
        console.log('Discount: ', discount);

        const dataDetail = {
            "intent": "sale",
            "payer": { "payment_method": "paypal" },
            "transactions": [{
                "amount": {
                    "total": total,
                    "currency": "PHP",
                    "details": {
                        "subtotal": subtotal.toFixed(2),
                        "tax": "0",
                        "shipping": "0",
                        "handling_fee": "0",
                        "shipping_discount": discountAmount.toFixed(2),
                        "insurance": "0"
                    }
                },
                "item_list": {
                    "items": items.map(item => ({
                        name: item.name,
                        price: Number(item.price).toFixed(2),
                        currency: "PHP",
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

        const clientId = 'AY0wJ5xDruWhJCzSlBicJwLx-d-tCE_NaK33BUJJ6vFOETi0bCLGPG7iOdEF6l8S12tiyQ8m-cC_HNYe';
        const secret = 'EPLiAzQuQncIOHTC9ypqhsygKUEEpc_9kAiuXrgHZbrychSFNGfx804JmP34RreL7pA9-jugarcqhYSS';
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

        if (!this.handled && url.includes('https://example.com') && url.includes('PayerID')) {
            this.handled = true;
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

function PaypalScreen() {
    const { items, discount } = useLocalSearchParams(); // Retrieve the `items` query param
    const [parsedItems, setParsedItems] = useState(null); // Default to null to indicate loading
    const [parsedDiscount, setParsedDiscount] = useState(0);

    useEffect(() => {
        if (items) {
            try {
                setParsedItems(JSON.parse(items)); // Parse the JSON string back into an array
            } catch (error) {
                console.log('Error parsing items:', error);
            }
        }

        if (discount) {
            setParsedDiscount(Number(discount));
        }
    }, [items, discount]);

    // Show a loading indicator until `items` is parsed
    if (parsedItems === null) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <Paypal
                items={parsedItems}
                discount={parsedDiscount}
                onPaymentStatus={(result) => {
                    // handle success or fail
                    router.back();
                    router.setParams({
                        paymentResult: JSON.stringify(result)
                    });
                }}
            />
        </View>
    );
}

export default PaypalScreen;
