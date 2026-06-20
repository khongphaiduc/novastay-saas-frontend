pipeline {
    agent any

    stages {
        // Stage 'Pull source code' cũ đã được xóa bỏ để tránh lỗi credential 'github-token'
        
        stage('Build and Push Image') {
            steps {
                withDockerRegistry(credentialsId: 'docker', url: 'https://index.docker.io/v1/') {
                    // Di chuyển vào thư mục dự án nếu cấu hình thư mục của bạn yêu cầu
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
                    # 1. Dừng và xóa container cũ mang tên 'fenovastay'
                    docker stop fenovastay || true
                    docker rm fenovastay || true
                    
                    # 2. Xóa image cũ để giải phóng dung lượng và cập nhật bản mới nhất
                    docker rmi ptrungduc1011/fenovastay:v1 || true

                    # 3. Chạy container mới trên port 9999 của VPS
                    docker run -d --name fenovastay -p 9999:80 ptrungduc1011/fenovastay:v1
                '''
            }
        }
    }
}
