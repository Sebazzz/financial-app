#!/bin/bash
UP_DIR=/home/fa-admin
UP_PKG=$UP_DIR/financial-app-ubuntu.16.10-x64.tar.gz

INST_DIR=/opt/fa-app-v2
INST_DIR_VOLATILE=$INST_DIR/app

BACKUP_DIR=/tmp
today=`date +%Y-%m-%d.%H:%M:%S`
BACKUP_FILE=backup-$today.tar.gz
BACKUP_FILE_PATH=$BACKUP_DIR/$BACKUP_FILE

function upgr_command {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "error with $1: exit code $status" >&2
    	exit $status
    fi
}

function upgr_svc_command {
    "$@"
    local status=$?
    if [ $status -ne 3 ]; then
        echo "error with $1: exit code $status" >&2
    	exit $status
    fi
}

echo Financial App upgrade script
echo Package source: $UP_PKG
echo Install directory: $INST_DIR
echo Backup file: $BACKUP_FILE_PATH

if (( $EUID != 0 )); then
  echo "Please run as root"
  exit
fi

echo Verifying file $UP_PKG
if [ ! -f $UP_PKG ]; then
    echo $UP_PKG does not exist
    exit -1
fi

echo Stopping
upgr_svc_command $INST_DIR/launch stop

echo Backup $INST_DIR to $BACKUP_FILE_PATH
upgr_command tar -zcvf $BACKUP_FILE_PATH $INST_DIR

echo Delete files from $INST_DIR_VOLATILE
rm -Rf $INST_DIR_VOLATILE

echo Copying files
cd $INST_DIR
upgr_command tar -xvf $UP_PKG

echo Chmod launch script and executable
upgr_command chmod +x $INST_DIR/app/App
upgr_command chmod +x $INST_DIR/launch

echo Starting...
upgr_svc_command $INST_DIR/launch start

echo kthxbye
