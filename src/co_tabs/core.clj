(ns co-tabs.core
  (:require [org.httpkit.server :as server]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer :all]
            [clojure.pprint :as pp]
            [clojure.string :as str]
            [clojure.data.json :as json]
            [ring.util.request :refer [character-encoding]]
            [ring.middleware.cors :refer [wrap-cors]])
  (:gen-class))

(require '[clojure.java.io :as io])
(use 'clostache.parser)

(defn extract-arrows [str-arrows]
  (map #(cond (= % \u) 8593
              (= % \d) 8595
              :else :none) str-arrows))

(defn extract-repeat [elt]
  (if (nil? (:repeat elt)) 1 (:repeat elt)))

(defn flat-tabs
  [tabs]
  (flatten (map
             #(repeat (extract-repeat %) {:image (:note %) :arrows (extract-arrows (:arrows %))})
             tabs)))



;(spit "resources/output.md" result)



(defn markdown [req]
  {:status  200
   :headers {"Content-Type" "text/json"}
   :body    (-> (let [p (:body req)
                      encoding (or (character-encoding req) "UTF-8")
                      body-string (slurp p :encoding encoding)
                      data (:body (json/read-json body-string))
                      model {:title (:title data)
                             :lines (map (fn [elt] {:tabs elt}) (partition 4 4 nil (flat-tabs (:tabs data))))}
                      result (render-resource "templates/markdown.mustache" model)]
                  (println model)
                  result))})

(defroutes app-routes
           (GET "/" [] (io/resource "public/index.html"))
           (POST "/markdown" [] markdown)
           ;(GET "/request" [] request-example)
           (route/not-found "Error, page not found!"))

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (server/run-server

      (wrap-defaults #'app-routes
                     (assoc-in site-defaults [:security :anti-forgery] false))
    {:port port})
  (println (str "Running webserver at http:/127.0.0.1:" port "/"))))




