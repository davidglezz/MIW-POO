# Programación Orientada a Objetos



Download schema vocabulary definition in jsonld format from:
```
wget https://schema.org/version/latest/schema.jsonld
```

## Deploy the system

### Client
```cd cliente```
And (
```php -S 0.0.0.0:8000```
Or
```python -m http.server 8000```
)

### Php Server
```
cd php/public
php -S 0.0.0.0:8001 php
```

### JavaScript Server
```
cd nodejs
npm install
sudo npm i --save sqlite3 --unsafe-perm

npm start
or
npm run dev
```
### Python Server
Dependencies
```
pip install Flask
pip install sqlite3
pip install isodate
pip install validators
pip install flask-cors

or 

pip install Flask isodate validators flask-cors
```
Run:
```
cd python
python .\main.py
```