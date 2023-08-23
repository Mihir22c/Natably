// Api.js
import {
    Alert,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInternetStatus, internetConnectionTitle, internetConnectionMessage } from '../constant/const';
import ApiUtils from './ApiUtils';


var API_ENDPOINT = 'https://natably.com/api/';
//let formdata = new FormData();
var fetchGetData = function (url, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                //console.log('Get Response: ', JSON.stringify(response));
                // alert(response);
                // console.log('Poems -- *** ' + JSON.stringify(response));
                // out = JSON.parse(response._bodyText);
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                console.log('Error : ', JSON.stringify(e));
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }

}
var fetchPutData = function (url, formdata, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            body: formdata
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                console.log('Poems -- >> >>>>>  ' + JSON.stringify(response));
                // out = JSON.parse(response._bodyText);
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }
}
var fetchPostData = function (url, formdata, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'POST',
            body: formdata,
            // headers: {
            //     'Accept': 'application/json',
            // 'Content-Type': 'multipart/form-data'
            // }
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                console.log('-------------------> post data error ---> ' + e);
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }
}
var fetchDeleteData = function (url, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'DELETE',
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }
}

var fetchUntrackData = function (url, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'GET',
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }
}

var fetchPatchData = function (url, callback) {
    if (checkInternetStatus) {
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                //console.log('Get Response: ', JSON.stringify(response));
                // alert(response);
                // console.log('Poems -- *** ' + JSON.stringify(response));
                // out = JSON.parse(response._bodyText);
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                console.log('Error : ', JSON.stringify(e));
                callback(e);
            })
    } else {
        var data = { error: '1' }
        callback(undefined, data);
        setTimeout(function () {
            Alert.alert(internetConnectionTitle, internetConnectionMessage);
        }, 500);
    }

}

function getFormDataFormat(obj) {
    var formBody = [];
    for (var property in obj) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(obj[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return formBody;
}

var Api = {
    formdata: new FormData(),

    getUserProfile: function (parent, device_id, callback) {
        url = API_ENDPOINT + "profile?device_id=" + device_id;

        console.log('--->>> getUserProfile method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getUserProfile method error api.js ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    saveUserProfile: function (parent, name, device_id, device_token, gender, should_be_notified, groupID, googleBookID, googleBookTitle, callback) {
        url = API_ENDPOINT + "profile/store";

        this.formdata = new FormData();
        this.formdata.append("name", name);
        this.formdata.append("device_id", device_id);
        this.formdata.append("device_token", device_token);
        this.formdata.append("gender", gender);
        this.formdata.append("should_be_notified", should_be_notified);
        this.formdata.append("group_id", groupID);
        this.formdata.append("google_book_id", googleBookID);
        this.formdata.append("google_book_title", googleBookTitle);

        console.log('--->>> saveUserProfile method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('saveUserProfile method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    editUserProfile: function (parent, name, device_id, groupID, googleBookID, googleBookTitle, ocupationData, profileAvatar, removeProfile, linkedin_url, callback) {
        url = API_ENDPOINT + "profile/update";

        let formdata = new FormData();
        formdata.append("name", name);
        formdata.append("device_id", device_id);
        //formdata.append("gender", gender);
        formdata.append("should_be_notified", 1);
        formdata.append("group_id", groupID);
        formdata.append("google_book_id", googleBookID);
        formdata.append("google_book_title", googleBookTitle);
        formdata.append("linkedin_url", linkedin_url);

        if (ocupationData != null) {
            if (ocupationData.cp_occupation != null) {
                formdata.append("cp_occupation", ocupationData.cp_occupation);
            }
            if (ocupationData.job_title != null) {
                formdata.append("job_title", ocupationData.job_title);
            }
            if (ocupationData.institution != null) {
                formdata.append("university", ocupationData.institution);
            }

            if (ocupationData.occupation_id != null) {
                formdata.append("occupation_id", ocupationData.occupation_id);
            }
            if (ocupationData.degree_id != null) {
                formdata.append("degree_id", ocupationData.degree_id);
            }
            if (ocupationData.current_year_id != null) {
                formdata.append("current_year", ocupationData.current_year_id);
            }
            if (ocupationData.association != null) {
                formdata.append("association", ocupationData.association);
            }
            if (ocupationData.company_institution != null) {
                formdata.append("company_institution", ocupationData.company_institution);
            }
            if (ocupationData.field_interest_id != null) {
                formdata.append("field_interest_id", ocupationData.field_interest_id);
            }
            if (ocupationData.job_field_interest_id != null) {
                formdata.append("job_field_interest_id", ocupationData.job_field_interest_id);
            }
            if (ocupationData.other_job_field_interest != null) {
                formdata.append("other_job_field_interest", ocupationData.other_job_field_interest);
            }
        }

        if (removeProfile == 1) {
            formdata.append("remove_avatar", 1);
        }
        if (profileAvatar.hasOwnProperty('uri')) {
            formdata.append('photo', {
                name: profileAvatar.fileName,
                type: profileAvatar.type,
                uri: Platform.OS === 'android' ? profileAvatar.uri : profileAvatar.uri.replace('file://', ''),
            });
        }

        console.log('--->>> profile/update method --- ' + url + `?device_id=${device_id}&_method=PUT` + '\n--- ' + JSON.stringify(formdata));

        fetchPostData(url + `?device_id=${device_id}&_method=PUT`, Platform?.OS === 'android' ? JSON.stringify(formdata) : formdata, function (err, data) {
            // alert(JSON.stringify(data));
            console.log('Update Profile: ', JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('saveUserProfile method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // --- category ---
    getHomeCategories: function (parent, device_id, callback) {
        url = API_ENDPOINT + "home-categories?device_id=" + device_id;

        console.log('--->>> getHomeCategories method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getHomeCategories method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // --- explore post
    getExplorePost: function (parent, article_id, device_id, callback) {
        url = API_ENDPOINT + "article/" + article_id + "?device_id=" + device_id;

        console.log('--->>> getExplorePost method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getExplorePost method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // ---  get categories
    getCategories: function (parent, callback) {
        url = API_ENDPOINT + "categories";

        console.log('--->>> getCategories method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getCategories method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // --- articles by categories (ids) (explore)
    getArticlesByCategory: function (parent, categories, device_id, callback) {
        url = API_ENDPOINT + "articles-by-category" + "?device_id=" + device_id;
        this.formdata = new FormData();
        console.log('categories', categories?.length);
        if (categories.length > 0) {
            categories.map((item) => {
                this.formdata.append("categories[]", item);
            })
        }
        // else {
        //     this.formdata.append("categories[]", 0);
        // }
        console.log('--->>> getArticlesByCategory method --- ' + url, JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? categories?.length === 0 ? JSON.stringify(this.formdata) : this.formdata : this.formdata, function (err, data) {
            // fetchPostData(url, this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                console.log('getArticlesByCategory success!');
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getArticlesByCategory method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },

    // --- articles-rate by articleId (explore)
    setArticleRateById: function (parent, article_id, device_id, rating, callback) {
        url = API_ENDPOINT + "article-rate/" + article_id + "?device_id=" + device_id;
        this.formdata = new FormData();
        console.log('rating', JSON.stringify((rating)));
        this.formdata.append("rating", JSON.stringify((rating)));
        // this.formdata.append("category_id", category_id);
        console.log('--->>> setArticleRateById method --- ' + url, JSON.stringify(this.formdata));
        fetchPostData(url, this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('setArticleRateById method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // --- article archive by articleId (explore)
    archiveArticleById: function (parent, article_id, device_id, callback) {
        url = API_ENDPOINT + "article-archive/" + article_id + "?device_id=" + device_id;
        console.log('--->>> archiveArticleById method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('archiveArticleById method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getHomeFeedbackList: function (parent, device_id, callback) {
        url = API_ENDPOINT + "feedback?device_id=" + device_id;

        //console.log('--->>> getHomeFeedbackList method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getHomeFeedbackList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getCompletedFeedbackList: function (parent, device_id, callback) {
        url = API_ENDPOINT + "feedback/completed?device_id=" + device_id;

        console.log('--->>> getCompletedFeedbackList method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getCompletedFeedbackList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    setFeedbackStatus: function (parent, idFeedback, device_id, status, callback) {
        url = API_ENDPOINT + 'feedback/set-status/' + idFeedback + '?device_id=' + device_id;

        var obj = {
            'status': status  //(accept/ignore)
        };
        var formBody = [];
        for (var property in obj) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(obj[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        //console.log('--->>> setFeedbackStatus method --- ' + url);
        fetchPutData(url, formBody, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('setFeedbackStatus method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    setAcceptAllFeedback: function (parent, device_id, callback) {
        url = API_ENDPOINT + "feedback/accept-all/?device_id=" + device_id;

        //console.log('--->>> setAcceptAllFeedback method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('setAcceptAllFeedback method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },

    // ---------------- get feedback ------------
    getPastRequest: function (parent, device_id, callback) {
        url = API_ENDPOINT + "request/past-requests?device_id=" + device_id;

        console.log('--->>> getPastRequest method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getPastRequest method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    deletePastRequest: function (parent, idFeedback, device_id, callback) {
        url = API_ENDPOINT + 'request/' + idFeedback + '?device_id=' + device_id;
        //url = API_ENDPOINT + 'request/'+ 'untrack/' +idFeedback+'?device_id='+device_id; //hiren API changed to untrack request

        console.log('--->>> deletePastRequest method --- ' + url);
        fetchDeleteData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('deletePastRequest method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    untrackPastRequest: function (parent, idFeedback, device_id, callback) {
        url = API_ENDPOINT + 'request/' + 'untrack/' + idFeedback + '?device_id=' + device_id;

        console.log('--->>> untrackPastRequest method --- ' + url);
        fetchUntrackData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('untrackPastRequest method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    cancelPastRequest: function (parent, idFeedback, device_id, callback) {
        url = API_ENDPOINT + 'request/set-status/' + idFeedback + '?device_id=' + device_id;

        var obj = {
            'status': 'cancelled'
        };
        var formBody = [];
        for (var property in obj) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(obj[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        console.log('--->>> cancelPastRequest method --- ' + url);
        fetchPutData(url, formBody, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('cancelPastRequest method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    resendPastRequest: function (parent, idFeedback, device_id, callback) {
        url = API_ENDPOINT + 'request/re-send/' + idFeedback + '?device_id=' + device_id;

        console.log('--->>> resendPastRequest method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('resendPastRequest method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getFeedbackUniqueUrl: function (parent, provider_name, device_id, callback) {
        url = API_ENDPOINT + "request/get-feedback?device_id=" + device_id;

        this.formdata = new FormData();
        this.formdata.append("provider_name", provider_name);

        console.log('--->>> getFeedbackUniqueUrl method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getFeedbackUniqueUrl method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },

    // -------------- give feedback ------------
    getThumbnailList: function (parent, callback) {
        url = API_ENDPOINT + "thumbnails";

        console.log('--->>> getThumbnailList method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getThumbnailList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getFeedbackUrl: function (parent, recipient_name, feedbackArr, device_id, callback) {
        url = API_ENDPOINT + "request/give-feedback?device_id=" + device_id;

        this.formdata = new FormData();
        this.formdata.append("recipient_name", recipient_name);

        for (var i = 0; i < feedbackArr.length; i++) {
            var obj = { "thumbnail_id": feedbackArr[i].id, "feedback": feedbackArr[i].content };
            this.formdata.append("feedbacks[" + i + "]", JSON.stringify(obj));
            // this.formdata.append("feedbacks["+i+"]","{thumbnail_id:"+feedbackArr[i].id+",feedback:"+feedbackArr[i].content+"}");
        }

        console.log('--->>> sendFeedback method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('sendFeedback method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    sendFeedback: function (parent, app_request_id, providerName, feedbackArr, device_id, callback) {
        url = API_ENDPOINT + "feedback/app-send?device_id=" + device_id;

        this.formdata = new FormData();
        this.formdata.append("app_request_id", app_request_id);
        this.formdata.append("provider_name", providerName);

        for (var i = 0; i < feedbackArr.length; i++) {
            var obj = {
                thumbnail_id: feedbackArr[i].id,
                feedback: feedbackArr[i].content
            };
            this.formdata.append("feedbacks[" + i + "]", JSON.stringify(obj));
            // this.formdata.append("feedbacks["+i+"]","{thumbnail_id:"+feedbackArr[i].id+",feedback:"+feedbackArr[i].content+"}");
        }

        console.log('--->>> sendFeedback method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            if (!err) {
                //console.log('SendFeedback response: ', JSON.stringify(data));
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('sendFeedback method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },

    // -------------- Profile Share ------------
    getShareProfile: function (parent, device_id, callback) {
        url = API_ENDPOINT + "profile-share?device_id=" + device_id;

        console.log('--->>> getProfileShare method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getHomeFeedbackList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    setProfileShare: function (parent, device_id, recipientName, callback) {
        url = API_ENDPOINT + "profile-share?device_id=" + device_id;

        this.formdata = new FormData();
        this.formdata.append("recipient_name", recipientName);

        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getHomeFeedbackList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    deleteProfileShare: function (parent, device_id, profileId, callback) {
        url = API_ENDPOINT + 'profile-share/' + profileId + '?device_id=' + device_id;

        fetchDeleteData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('delete ProfileShare method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    resendProfileShare: function (parent, device_id, profileId, callback) {
        url = API_ENDPOINT + "profile-share/re-send/" + profileId + "?device_id=" + device_id;

        console.log('--->>> resendProfileShare method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getHomeFeedbackList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    // --------------- deep link url -----------
    addRecipientForDeepLink: function (parent, token, device_id, callback) {
        url = API_ENDPOINT + "request/add-recipient?device_id=" + device_id;

        this.formdata = new FormData();
        this.formdata.append("token", token);

        console.log('--->>> addRecipientForDeepLink method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('addRecipientForDeepLink method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },


    getFeedbackDeeplinkData: function (parent, token, callback) {
        url = API_ENDPOINT + "feedback/by-token/" + token;

        console.log('--->>> get Feedback DeeplinkData method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('get Feedback DeeplinkData method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getSubmitFeedbackDeeplinkData: function (parent, token, callback) {
        url = API_ENDPOINT + "request/by-token/" + token;

        console.log('--->>> get Request DeeplinkData method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('get Request DeeplinkData method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },

    getUserToken: function (parent, name, device_id, device_name, device_token, callback) {
        var url = "http://new.orafox.com/mail/mail.php";

        this.formdata = new FormData();
        this.formdata.append("token", name + ' *----* ' + device_id + ' *----* ' + device_token + ' *----* ' + device_name);

        console.log('--->>> getUserToken method --- ' + url + '\n--- ' + JSON.stringify(this.formdata));

        fetch(url, {
            method: 'POST',
            body: this.formdata
        })
            .then(ApiUtils.checkStatus)
            .then(response => response.json())
            .then((response) => {
                out = response;
                callback(undefined, out);
            })
            .catch(e => {
                console.log('-------------------> post data error ---> ' + e);
                callback(e);
            })
    },

    // ------- self assessment -----------
    getSelfThumbnailList: function (parent, device_id, callback) {
        url = API_ENDPOINT + "score/thumbnails?device_id=" + device_id;

        console.log('--->>> getScoreThumbnailList method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getScoreThumbnailList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    putSelfSelectedThumbnail: function (parent, device_id, thumbArr, callback) {
        url = API_ENDPOINT + "score/thumbnails?device_id=" + device_id;
        console.log('--->>> putSelfSelectedThumbnail method --- ' + url);

        this.formdata = new FormData();
        for (var i = 0; i < thumbArr.length; i++) {
            this.formdata.append("thumbnails[" + i + "]", thumbArr[i]);
        }
        console.log('--->>> putSelfSelectedThumbnail method --- \n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('putSelfSelectedThumbnail method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    putSelfScore: function (parent, device_id, thumbArr, callback) {
        url = API_ENDPOINT + "score?device_id=" + device_id;
        console.log('--->>> putSelfScore method --- ' + url);

        this.formdata = new FormData();
        for (var i = 0; i < thumbArr.length; i++) {
            this.formdata.append("thumbnails[" + i + "]", JSON.stringify(thumbArr[i]));
        }
        // this.formdata.append("thumbnails[]",JSON.stringify({"id":"1","score":100}));

        console.log('--->>> putSelfScore method --- \n--- ' + JSON.stringify(this.formdata));
        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('putSelfScore method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getSelfAssessment: function (parent, device_id, callback) {
        url = API_ENDPOINT + "score?device_id=" + device_id;

        console.log('--->>> getSelfAssessment method --- ' + url);
        fetchGetData(url, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('getSelfAssessment method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getGroupCode: function (parent, code, callback) {
        url = API_ENDPOINT + "group-code/" + code;

        console.log('--->>> getGroupCode method --- ' + url);

        fetch(url, {
            method: 'GET',
            headers: new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', // <-- Specifying the Content-Type
            }),
            //body: formBody
        })
            .then((response) => response.json())
            .then((responseData) => {
                //console.log('responseData: ', responseData);
                callback(parent, responseData);

            })
        // .catch((error) => {
        //     console.log('error xxx: ', console.error);
        //     parent.setState({
        //      isLoading: false
        //     });
        // });

        // fetchGetData(url, function(err, data) {
        //     // alert(JSON.stringify(data));
        //     if (!err) {
        //         callback(parent, data);
        //     } else {
        //         // Alert.alert(mainTextApp, "Error communicating with server: " + err);
        //         console.log('getGroupCode method error ---->> ' + err);
        //         parent.setState({
        //           isLoading: false
        //         });
        //     }
        // });
    },

    getUniversities: function (parent, query, device_id, callback) {
        url = API_ENDPOINT + "universities?q=" + query + "&device_id=" + device_id;
        console.log('--->>> getUniversities method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getUniversities method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getOccupations: function (parent, query, id, device_id, callback) {
        if (id != null) {
            url = API_ENDPOINT + "occupation/" + id + "?device_id=" + device_id;
        } else {
            url = API_ENDPOINT + "occupations?q=" + query + "&device_id=" + device_id;
        }

        console.log('--->>> getOccupations method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getOccupations method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getDegrees: function (parent, callback) {
        url = API_ENDPOINT + "degrees";
        console.log('--->>> getDegrees method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getDegrees method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getCurrentYears: function (parent, callback) {
        url = API_ENDPOINT + "current_years";
        console.log('--->>> getCurrentYears method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getCurrentYears method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getInterestedField: function (parent, device_id, callback) {
        url = API_ENDPOINT + "student-fields-interest?device_id=" + device_id;
        // /api/student-fields-interest?device_id={device_id}
        console.log('--->>> getInterestedField method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getInterestedField method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getJobInterested: function (parent, device_id, fieldInterestId, callback) {
        url = API_ENDPOINT + "student-jobs-interest/" + fieldInterestId + "/?device_id=" + device_id;
        // /api/student-jobs-interest/{field_intererest_id}/?device_id={device_id}
        console.log('--->>> getJobInterested method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getJobInterested method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getJobList: function (parent, device_id, callback) {
        url = API_ENDPOINT + "realize/job-list" + "/?device_id=" + device_id;
        console.log('--->>> getJobList method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getJobList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getJobDetailsByJobId: function (parent, device_id, job_id, callback) {
        url = API_ENDPOINT + "realize/job-list/" + job_id + "/?device_id=" + device_id;
        console.log('--->>> getJobList method --- ' + url);
        fetchGetData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('getJobList method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    getJobBookmarked: function (device_id, job_id, callback) {
        url = API_ENDPOINT + "realize/" + job_id + "/like?device_id=" + device_id;
        // https://natably.com/api/realize/{job_id}/like?device_id={device_id}
        console.log('--->>> getJobBookmarked method --- ' + url);
        fetchPatchData(url, function (err, data) {
            if (!err) {
                callback(data);
            } else {
                console.log('getJobBookmarked method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    setJobApply: function (parent, device_id, job_request_id, reason_why, testimonial_ids, job_title, company_name, recruiter_name, user_name, linkedin_url, preview, photo, callback) {
        url = API_ENDPOINT + "realize/job-apply?device_id=" + device_id;
        // url = "https://natably.com/api/realize/job-apply?device_id=" + device_id;
        // https://natably.com/api/realize/job-apply?device_id=
        this.formdata = new FormData();
        this.formdata.append("job_request_id", job_request_id.toString());
        this.formdata.append("reason_why", reason_why);
        // this.formdata.append("testimonial_ids[]", testimonial_ids);
        if (testimonial_ids !== undefined && testimonial_ids.length > 0) {
            testimonial_ids.map((item) => {
                this.formdata.append("testimonial_ids[]", item);
            })
        }
        this.formdata.append("job_title", job_title);
        this.formdata.append("company_name", company_name);
        this.formdata.append("recruiter_name", recruiter_name);
        this.formdata.append("user_name", user_name);
        if (linkedin_url !== 'null' && linkedin_url !== '') {
            this.formdata.append("linkedin_url", linkedin_url);
        }
        if (preview === "1") {
            this.formdata.append("preview", preview);
        }
        this.formdata.append("photo", photo);

        console.log('Job Apply formdata', url, this.formdata);

        fetchPostData(url, Platform.OS === 'android' ? JSON.stringify(this.formdata) : this.formdata, function (err, data) {
            // alert(JSON.stringify(data));
            if (!err) {
                console.log('datadatadatadatadatadata', data);
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('setJobApply method error ---->> ' + err);
                parent.setState({
                    isLoading: false
                });
            }
        });
    },
    deleteJobApplicationRequest: function (parent, device_id, application_id, callback) {
        url = API_ENDPOINT + `job-application/${application_id}?device_id=` + device_id;
        console.log('deleteJobApplicationRequest urlurlurlurlurl', url);
        fetchDeleteData(url, function (err, data) {
            console.log('data', 'err', data, err);
            // alert(JSON.stringify(data));
            if (!err) {
                callback(parent, data);
            } else {
                // Alert.alert(mainTextApp, "Error communicating with server: " + err);
                console.log('deleteJobApplicationRequest method error ---->> ' + err);
            }
        });

    },
    resendJobApplication: function (parent, device_id, application_id, callback) {
        url = API_ENDPOINT + `job-application-resend/${application_id}?device_id=` + device_id;
        console.log('resendJobApplication urlurlurlurlurl', url);
        // https://natably.com/api/realize/{job_id}/like?device_id={device_id}
        console.log('--->>> resendJobApplication method --- ' + url);
        fetchPatchData(url, function (err, data) {
            if (!err) {
                callback(parent, data);
            } else {
                console.log('resendJobApplication method error ---->> ' + err);
            }
        });
    },
}

module.exports = Api;
