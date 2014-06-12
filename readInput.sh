#!/bin/sh

while true
do
	echo $(($(date +%s%N)/1000000)) && cat /sys/devices/ocp.2/helper.14/AIN0
done

