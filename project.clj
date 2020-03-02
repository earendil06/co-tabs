(defproject co-tabs "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url  "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [clj-commons/clj-yaml "0.7.0"]
                 [de.ubercode.clostache/clostache "1.4.0"]
                 [compojure "1.6.1"]
                 [http-kit "2.3.0"]
                 [ring/ring-defaults "0.3.2"]
                 [org.clojure/data.json "0.2.6"]
                 [ring-cors "0.1.13"]
                 ]
  :repl-options {:init-ns co-tabs.core}
  :profiles
  {:uberjar {:aot :all}}
  :main co-tabs.core)
