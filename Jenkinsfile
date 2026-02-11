pipeline {
    agent any

    triggers {
        githubPush()
    }

    stages {
        stage('Run Ansible Deployment') {
            steps {
                script {
                    sh """
                    cd /opt/ansible/furniture-frontend
                    ansible-playbook -i inventory.ini furniture-frontend.yaml
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check Jenkins console output."
        }
    }
}
