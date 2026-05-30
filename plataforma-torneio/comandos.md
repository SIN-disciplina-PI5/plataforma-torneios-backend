
SonarQube com Docker!!!

docker compose up -d

token
sqp_33b3fd89d2b650d748f1221dfe49e36ea08566c5


docker run --rm --network=host -e SONAR_HOST_URL=http://localhost:9000 -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli sonar-scanner `
 "-Dsonar.projectKey=arena-lagoa-backend" `
"-Dsonar.sources=." `
 "-Dsonar.host.url=http://host.docker.internal:9000" `
"-Dsonar.login=sqp_33b3fd89d2b650d748f1221dfe49e36ea08566c5"

























PS D:\PROJETOS VS CODE\PI5\backend\plataforma-torneios-backend\plataforma-torneio> docker run --rm `
>>   --network=host `
>>   -e SONAR_HOST_URL=http://localhost:9000 `
>>   -v "${PWD}:/usr/src" `
>>   sonarsource/sonar-scanner-cli `
>>   sonar-scanner `
>>   -Dsonar.projectKey=arena-lagoa-backend `
>>   -Dsonar.sources=. `
>>   -Dsonar.host.url=http://host.docker.internal:9000 `
>>   -Dsonar.login=SEU_TOKEN
Unable to find image 'sonarsource/sonar-scanner-cli:latest' locally
latest: Pulling from sonarsource/sonar-scanner-cli


admin
admin123


windows
sonar-scanner.bat -D"sonar.projectKey=arena-lagoa-backend" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.login=sqp_33b3fd89d2b650d748f1221dfe49e36ea08566c5"


docker run \
--rm \
-e SONAR_HOST_URL="https://${SONAR_HOST_URL}"  \
-v "${PROJECT_BASEDIR}:/usr/src" \
sonarsource/sonar-scanner-cli


 docker container run --rm --network=host -e SONAR_HOST_URL"http://localhost:9000" -v "./api:/" sonarsource/sonar-scanner-cli sonar-scanner.bat -D"sonar.projectKey=arena-lagoa-backend" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.login=sqp_33b3fd89d2b650d748f1221dfe49e36ea08566c5"
