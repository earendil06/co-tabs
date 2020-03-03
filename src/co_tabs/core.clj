(ns co-tabs.core
  (:require [org.httpkit.server :as server]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer :all]
            [clojure.data.json :as json]
            [ring.util.request :refer [character-encoding]])
  (:gen-class))

(require '[clojure.java.io :as io])
(use 'clostache.parser)

(defn extract-arrows [str-arrows]
  (let [ignore-bad-character (filter #(or (= % \d) (= % \u)) str-arrows)]
    (map #(if (= % \u) 8593 8595) ignore-bad-character)))

(defn extract-repeat [elt]
  (if (nil? (:repeat elt)) 1 (:repeat elt)))

(defn flat-tabs
  [tabs]
  (flatten (map
             #(repeat (extract-repeat %) {:image (:note %) :arrows (extract-arrows (:arrows %))})
             tabs)))


(defn markdown [req]
  {:status  200
   :headers {"Content-Type" "text/json"}
   :body    (-> (let [p (:body req)
                      encoding (or (character-encoding req) "UTF-8")
                      body-string (slurp p :encoding encoding)
                      data (:body (json/read-json body-string))
                      model {:title (if (empty? (:title data)) "No title" (:title data))
                             :lines (map (fn [elt] {:tabs elt}) (partition 4 4 nil (flat-tabs (:tabs data))))}
                      result (render-resource "templates/markdown.mustache" model)]
                  (println model)
                  result))})


(defonce list-notes
         (let [file-seq (map str (file-seq (clojure.java.io/file "resources/public/images")))
               only-png (filter #(.endsWith % ".png") file-seq)
               names (map #(last (.split % "/")) only-png)
               no-exts (map #(.replaceAll % ".png" "") names)]
           (group-by first no-exts)))

(defn notes [req]
  {:status  200
   :headers {"Content-Type" "text/json"}
   :body    (json/write-str list-notes)})

(defroutes app-routes
           (GET "/" [] (io/resource "public/index.html"))
           (POST "/markdown" [] markdown)
           (GET "/notes" [] notes)
           (route/not-found "Error, page not found!"))

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (server/run-server
      (wrap-defaults #'app-routes
                     (assoc-in site-defaults [:security :anti-forgery] false)) {:port port})
    (println (str "Running webserver at http:/127.0.0.1:" port "/"))))




