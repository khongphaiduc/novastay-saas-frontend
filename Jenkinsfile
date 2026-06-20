pipeline {
    agent any

    stages {
        
        stage('Pull source code') {
            steps {
                git branch: 'main',
                    credentialsId: 'FE-NovaStay',
                    url: 'https://github.com/khongphaiduc/novastay-saas-frontend.git'
            }
        }



   stage('Build and Push Image') {
          steps {

          withDockerRegistry(credentialsId: 'docker', url: 'https://index.docker.io/v1/')  {
                 
                 dir('NovaStay') {
                     sh 'docker build -t ptrungduc1011/fenovastay:v1 .' 
                     sh 'docker push ptrungduc1011/fenovastay:v1'                     
                 }
             }
          }
       }

        stage('Deploy') {
          steps {
             sh '''
                # 1. Dừng và xóa container cũ mang tên 'my-profile'
                docker stop fenovastay || true
                docker rm fenovastay || true
                
                # 2. Xóa image cũ để giải phóng dung lượng (tùy chọn)
                docker rmi ptrungduc1011/fenovastay:v1 || true

                # 3. Chạy container mới với cùng cấu hình cổng như cũ
                # Ánh xạ 8090 (VPS) -> 8080 (Container) theo đúng ảnh bạn gửi
                docker run -d --name fenovastay -p 9999:80 ptrungduc1011/fenovastay:v1
             '''
          }
       }


    }
}
