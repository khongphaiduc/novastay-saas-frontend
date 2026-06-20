pipeline {
    agent any

    stages {
        stage('Pull source code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/khongphaiduc/novastay-saas-frontend.git'
            }
        }
    }
}