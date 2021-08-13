import { Observable } from '@nativescript/core';
// @ts-ignore
import { OAuth } from 'oauth-1.0a';
import { CryptoJS } from 'crypto-js';

export class NativescriptWoocommerceApiCommon extends Observable {
  url : '';
  wpAPI :  false;
  wpAPIPrefix :  'wp-json';
  version :  'v3';
  isSsl : boolean;
  consumerKey : '';
  consumerSecret : '';
  verifySsl : boolean ;
  encoding :  'utf8';
  queryStringAuth :  false;
  port :  '';
  timeout : '';
  private classVersion: '1.0.0';
  constructor(opt) {
    super();

    opt = opt || {};

    if (!opt.url) {
      throw new Error('url is required');
    }

    if (!opt.consumerKey) {
      throw new Error('consumerKey is required');
    }

    if (!opt.consumerSecret) {
      throw new Error('consumerSecret is required');
    }
    this._setDefaultsOptions(opt);
  }


    /**
     * Set default options
     *
     * @param {Object} opt
     */
    private _setDefaultsOptions  (opt) {
      this.url = opt.url;
      this.wpAPI = opt.wpAPI || false;
      this.wpAPIPrefix = opt.wpAPIPrefix || 'wp-json';
      this.version = opt.version || 'v3';
      this.isSsl = /^https/i.test(this.url);
      this.consumerKey = opt.consumerKey;
      this.consumerSecret = opt.consumerSecret;
      this.verifySsl = false === opt.verifySsl ? false : true;
      this.encoding = opt.encoding || 'utf8';
      this.queryStringAuth = opt.queryStringAuth || false;
      this.port = opt.port || '';
      this.timeout = opt.timeout;
    };

    /**
     * Normalize query string for oAuth
     *
     * @param  {string} url
     * @return {string}
     */
    private _normalizeQueryString (url) {
      // Exit if don't find query string
      if (-1 === url.indexOf('?')) {
        return url;
      }

      //var query       = _url.parse(url, true).query;
      var query = url;
      var params = [];
      var queryString = '';

      for (var p in query) {
        params.push(p);
      }
      params.sort();

      for (var i in params) {
        if (queryString.length) {
          queryString += '&';
        }

        queryString += encodeURIComponent(params[i])
          .replace('%5B', '[')
          .replace('%5D', ']');
        queryString += '=';
        queryString += encodeURIComponent(query[params[i]]);
      }

      return url.split('?')[0] + '?' + queryString;
    };

    /**
     * Get URL
     *
     * @param  {String} endpoint
     *
     * @return {String}
     */
    private _getUrl (endpoint) {
      var url = '/' === this.url.slice(-1) ? this.url : this.url + '/';
      var api = this.wpAPI ? this.wpAPIPrefix + '/' : 'wp-json/';

      url = url + api + this.version + '/' + endpoint;

      // Include port.
      if ('' !== this.port) {
        var hostname = url; //_url.parse(url, true).hostname;
        url = url.replace(hostname, hostname + ':' + this.port);
      }

      if (!this.isSsl) {
        return this._normalizeQueryString(url);
      }

      return url;
    };

    /**
     * Get OAuth
     *
     * @return {Object}
     */
    private _getOAuth () {
      let data = {
        consumer: {
          key: this.consumerKey,
          secret: this.consumerSecret,
        },
        signature_method: 'HMAC-SHA256', last_ampersand: undefined,

        hash_function: function(base_string, key) {
          return CryptoJS.HmacSHA256(base_string, key).toString(
            CryptoJS.enc.Base64
          );
        },
      };

      if (-1 < ['v1', 'v2'].indexOf(this.version)) {
        data.last_ampersand = false;
      }
      return new OAuth(data);
    };

    /**
     * Join key object value to string by separator
     */
    private join (obj, separator) {
      var arr = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          arr.push(key + '=' + obj[key]);
        }
      }
      return arr.join(separator);
    };

    /**
     * Do requests
     *
     * @param  {String}   method
     * @param  {String}   endpoint
     * @param  {Object}   data
     * @param  {Function} callback
     *
     * @return {Object}
     */
    private _request (method, endpoint, data) {
      var url = this._getUrl(endpoint);
      var getHeader = false;

      var params = {
        encoding: this.encoding,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'WooCommerce API React Native/' + this.classVersion,
          'Content-Type': 'application/json',
        }, qs: undefined,
        auth: undefined,
        strictSSL: undefined

      };

      if (this.isSsl) {
        if (this.queryStringAuth) {
          params.qs = {
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
          };
        } else {
          params.auth = {
            user: this.consumerKey,
            pass: this.consumerSecret,
          };
        }

        if (!this.verifySsl) {
          params.strictSSL = false;
        }
      } else {
        params.qs = this._getOAuth().authorize({
          url: url + '?' + this.join(data, '&'),
          method: method,
        });

      }

      // encode the oauth_signature to make sure it not remove + charactor
      //params.qs.oauth_signature = encodeURIComponent(params.qs.oauth_signature);
      var requestUrl = url + '?' + this.join(params.qs, '&');
      // console.log(data)
      debugger
      if (method === 'GET') {
        if (data) {
          requestUrl += '&' + this.join(data, '&');
          getHeader = typeof data.header !== 'undefined' ? data.header : false;
        }
        debugger

        // console.log('encode', params.qs.oauth_signature);
        //console.log(requestUrl);
        return fetch(requestUrl, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        }).then((response) => getHeader ? response.json().then(data => ({
          header: response.headers,
          data: data
        })) : response.json());
      } else {
        return fetch(requestUrl, {
          method: method,
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        }).then((response) => response.json());
      }
    };

    /**
     * GET requests
     *
     * @param  {String}   endpoint
     * @param  {Object}   data
     *
     * @return {Object}
     */
    public invokeGet (endpoint, data) {
      debugger
      return this._request('GET', endpoint, data);
    };

    /**
     * POST requests
     *
     * @param  {String}   endpoint
     * @param  {Object}   data
     * @param  {Function} callback
     *
     * @return {Object}
     */
    public invokePost (endpoint, data) {
debugger
      return this._request('POST', endpoint, data);
    };

    /**
     * PUT requests
     *
     * @param  {String}   endpoint
     * @param  {Object}   data
     * @param  {Function} callback
     *
     * @return {Object}
     */
    private invokePut (endpoint, data) {
      return this._request('PUT', endpoint, data);
    };

    /**
     * DELETE requests
     *
     * @param  {String}   endpoint
     * @param  {Function} callback
     *
     * @return {Object}
     */
    private invokeDelete(endpoint) {
      return this._request('DELETE', endpoint, null);
    };

    /**
     * OPTIONS requests
     *
     * @param  {String}   endpoint
     * @param  {Function} callback
     *
     * @return {Object}
     */
    public options () {
      return this._request('OPTIONS', this.url, null);
    };



}
