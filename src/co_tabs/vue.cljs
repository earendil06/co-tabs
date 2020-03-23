(ns co_tabs.vue
  (:refer-clojure :exclude [atom])
  (:require [glue.core :as g :refer [atom]]))

(defonce firebase (. js/window -firebase))
(defonce firebase-config {
                          :apiKey            "AIzaSyADKild1U0LwKOAMQcl56HtTa-l7CPlANY"
                          :authDomain        "cotabs-d4fac.firebaseapp.com"
                          :databaseURL       "https://cotabs-d4fac.firebaseio.com"
                          :projectId         "cotabs-d4fac"
                          :storageBucket     "cotabs-d4fac.appspot.com"
                          :messagingSenderId "376742261185"
                          :appId             "1:376742261185:web:0f324f7b951793b458ff40"
                          })

(enable-console-print!)
(.initializeApp firebase (clj->js firebase-config))

;(defn firebase-db [] (.firestore firebase))
(defonce firebase-auth (.auth firebase))

(defn current-user [] (.-currentUser firebase-auth))

(defonce app
         (g/vue {:el       "#app"
                 :data     {
                            :editor     ""
                            :title      ""
                            :mouseOver  ""
                            :musicsDb   []
                            :email      "sadf"
                            :password   ""
                            :user       nil
                            :resultHtml ""
                            :inputModal ""
                            }
                 :computed {
                            :model            (fn [this state] {})
                            :logged           (fn [this state] false)
                            :firebaseEmail    (fn [this state]
                                                (if (nil? (current-user)) "" (.-email (current-user))))
                            :noteViewerSrc    (fn [this state] "")
                            :downloadDisabled (fn [this state] true)
                            :saveDisabled     (fn [this state] true)
                            }

                 :methods  {
                            :loginFirebase  (fn [this state _]
                                              (println (:email (:data ()))
                                              (.signInWithEmailAndPassword firebase-auth (:email state) (:password state)))
                            :logoutFirebase (fn [this state _])
                            :mouseOverNote  (fn [this state _])
                            :mouseOutNote   (fn [this state _])
                            :downloadAsPDF  (fn [this state _])
                            :createMusic    (fn [this state _])
                            :loadOnline     (fn [this state _])
                            :rmOnline       (fn [this state _])
                            }
                 }))
;
;(.then
;  (.signInWithEmailAndPassword firebase-auth "test@test.fr" "password")
;  (fn []
;    (set! (.-user app (current-user))
;    )))
