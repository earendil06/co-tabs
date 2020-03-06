(ns co-tabs.core
  (:require [org.httpkit.server :as server]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer :all]
            [clojure.data.json :as json]
            [ring.util.request :refer [character-encoding]]
            [config.core :refer [env]])
  (:gen-class))

(require '[clojure.java.io :as io])
(use 'clostache.parser)


(defn arrow-str->arrows-codes [arrow-string]
  (let [ignore-bad-character (filter #{\d \u \) \(} arrow-string)
        mapping {\u 8593 \d 8595 \( 40 \) 41}
        get-map (partial get mapping)]
    (map get-map ignore-bad-character)))


(defn make-tab
  [note arrow-string]
  {:image note :arrows (arrow-str->arrows-codes arrow-string)})


(defn flat-tabs
  [list-tabs]
  (flatten (map #(repeat (:repeat %) (make-tab (:note %) (:arrows %))) list-tabs)))

(defn extract-name-path [path]
  (last (.split path "/")))

(defn remove-extension [name]
  (.replaceAll name ".png" ""))

(defonce list-notes
         (let [file-seq (map str (file-seq (clojure.java.io/file "resources/public/images")))
               only-png (filter #(.endsWith % ".png") file-seq)
               res (map (comp extract-name-path remove-extension) only-png)
               groups-by-note (group-by #(.toString (first %)) (sort res))]
           (map #(assoc {} :name (key %) :note-set (val %)) groups-by-note)))

(defn find-first [f coll]
  (first (filter f coll)))

(def not-nil? (complement nil?))

(defn note-exists? [note]
  (let [group (find-first #(= (:name %) (str (first note))) list-notes)]
    (not-nil? (some #{note} (:note-set group)))))

(defn extract-tabs [rawtext]
  (let [lines (remove empty? (map #(remove empty? (.split % " ")) (.split rawtext "\n")))
        structured-lines (map #(let [[n a r] %] {:note n :arrows (or a "") :repeat (Integer/parseInt (or r "1"))}) lines)
        remove-non-existing-notes (filter #(note-exists? (:note %)) structured-lines)]
    (flat-tabs remove-non-existing-notes)))

(defn extract-body-from-request [req]
  (let [p (:body req)
        encoding (or (character-encoding req) "UTF-8")
        body-string (slurp p :encoding encoding)
        data (:body (json/read-json body-string))]
    data))

(defn index [req]
  (render-resource "public/index.html" {:host (:host env) :notes list-notes}))

(defn markdown [req]
  {:status  200
   :headers {"Content-Type" "text/json"}
   :body    (-> (let [data (extract-body-from-request req)
                      number-by-line 4
                      model {:title (:title data)
                             :lines (map (partial assoc {} :tabs)
                                         (partition number-by-line number-by-line nil
                                                    (extract-tabs (:rawText data))))}
                      result (render-resource "templates/markdown.mustache" model)]
                  result))})

(defroutes app-routes
           (GET "/" [] index)
           (POST "/markdown" [] markdown)
           (route/not-found "Error, page not found!"))

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (server/run-server
      (wrap-defaults #'app-routes
                     (assoc-in site-defaults [:security :anti-forgery] false)) {:port port})
    (println (str "Running webserver at http:/127.0.0.1:" port "/"))))
